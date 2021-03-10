import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";
import * as xapix from "@xapix-io/infra-utils";
import configs from "../config";

function makeEnvVars(
  domainBase: string,
  mongoURI: string,
  mongoIP: string,
): k8s.types.input.core.v1.EnvVar[] {
  return [
    {
      name: "NODE_ENV",
      value: "production",
    },
    {
      name: "BASE_URL",
      value: `https://foley.${domainBase}/`,
    },
    {
      name: "MONGO_URI",
      value: mongoURI,
    },
    {
      name: "WAIT_HOSTS",
      // This is a placeholder - use refs
      value: `${mongoIP}:27017`,
    },
  ];
}

export default function ({
  mongoOutputs,
  provider,
  namespace,
  version,
}: {
  mongoOutputs: {
    uri: pulumi.Output<string>,
    ip: pulumi.Output<string>,
  },
  provider: k8s.Provider;
  version: string;
  namespace: pulumi.Output<string>;
}) {
  const stack = pulumi.getStack();
  const appLabels = { app: "foley" };
  const image = `xapixio/foley:${version}`;
  const config = configs.prefixed("xapix-foley-common");
  const frontendConfig = configs.prefixed("xapix-foley-frontend");
  const backendConfig = configs.prefixed("xapix-foley-backend");

  const domainBase = config.require("domain-base");
  const frontendMemoryMB = frontendConfig.requireNumber("require-memory");
  const backendMemoryMB = backendConfig.requireNumber("require-memory");

  const env = pulumi.all([mongoOutputs.uri, mongoOutputs.ip])
    .apply(([uri, ip]) => makeEnvVars(domainBase, uri, ip));

  const publishServiceArgs = {
    namespace,
    appLabels,
    provider,
  };

  // xapix.k8sService.publishService({
  //   ...publishServiceArgs,
  //   domain: `foley.${domainBase}`,
  //   service: {
  //     create: true,
  //     name: "foley-backend",
  //     targetPort: 3000,
  //     selector: appLabels,
  //   },
  // });

  const frontendIngress = xapix.k8sService.publishService({
    ...publishServiceArgs,
    domain: `foley.${domainBase}`,
    service: {
      create: true,
      name: "foley-frontend",
      targetPort: 8080,
      selector: appLabels,
    },
  });

  // const frontendService = new k8s.core.v1.Service("foley-frontend", {
  //   metadata: {
  //     name: "foley-frontend",
  //     namespace,
  //     labels: {
  //       "xapix/http-monitor": "true",
  //     },
  //   },
  //   spec: {
  //     type: "ClusterIP",
  //     ports: [
  //       {
  //         name: "http",
  //         port: 80,
  //         protocol: "TCP",
  //         targetPort: 8080,
  //       },
  //     ],
  //     selector: appLabels,
  //   },
  // }, { provider });

  const backendService = new k8s.core.v1.Service("foley-backend", {
    metadata: {
      name: "foley-backend",
      namespace,
      labels: {
        "xapix/http-monitor": "true",
      },
    },
    spec: {
      type: "ClusterIP",
      ports: [
        {
          name: "http",
          port: 3000,
          protocol: "TCP",
          targetPort: 3000,
        },
      ],
      selector: appLabels,
    },
  }, { provider });

  const appResource = new k8s.apps.v1.ReplicaSet(
    `foley-${stack}-repset`,
    {
      metadata: { namespace },
      spec: {
        selector: { matchLabels: appLabels },
        replicas: config.getNumberWithDefault("replicas"),
        template: {
          metadata: { labels: appLabels },
          spec: {
            containers: [
              {
                name: "foley-app-frontend",
                image,
                args: ["frontend"],
                readinessProbe: {
                  httpGet: {
                    path: "/",
                    port: 8080,
                  },
                  initialDelaySeconds: 10,
                  periodSeconds: 5
                },
                env,
                ports: [{ containerPort: 8080 }],
                resources: {
                  requests: {
                    memory: frontendMemoryMB + "Mi",
                    cpu: frontendConfig.require("require-cpu"),
                  },
                  limits: {
                    memory: Math.round(frontendMemoryMB * 1.2) + "Mi",
                    cpu: frontendConfig.require("require-cpu"),
                  },
                },
                securityContext: {
                  capabilities: {
                    drop: ["ALL"],
                  },
                  readOnlyRootFilesystem: true,
                },
              },
              {
                name: "foley-app-backend",
                image,
                args: ["backend"],
                env,
                ports: [{ containerPort: 3000 }],
                resources: {
                  requests: {
                    memory: backendMemoryMB + "Mi",
                    cpu: backendConfig.require("require-cpu"),
                  },
                  limits: {
                    memory: Math.round(backendMemoryMB * 1.2) + "Mi",
                    cpu: backendConfig.require("require-cpu"),
                  },
                },
                securityContext: {
                  capabilities: {
                    drop: ["ALL"],
                  },
                  readOnlyRootFilesystem: true,
                },
              },
            ],
            imagePullSecrets: [
              {
                // [AGREEMENT]: we assume that this secret with docker credentials is deployed on the referred cluster
                name: "dockerconfig",
              },
            ],
          },
        },
      },
    },
    { provider }
  );

  return { endpoints: frontendIngress };
}
