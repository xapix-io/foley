import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";
import configs from "../config";

function makeEnvVars(
  domain: string,
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
      value: `https://${domain}/`,
    },
    {
      name: "MONGO_URI",
      value: mongoURI,
    },
    {
      name: "WAIT_HOSTS",
      value: `${mongoIP}:27017`,
    },
  ];
}

export default function ({
  mongo,
  provider,
  namespace,
  version,
}: {
  mongo: {
    dbName: pulumi.Input<string>,
    dbUsername: pulumi.Input<string>,
    dbPassword: pulumi.Input<string>,
    hostname: pulumi.Input<string>
  },
  provider: k8s.Provider;
  version: string;
  namespace: pulumi.Input<string>;
}) {
  const stack = pulumi.getStack();
  const selectorLabels = { app: "foley" };
  const image = `xapixio/foley:${version}`;
  const config = configs.prefixed("xapix-foley-common");
  const frontendConfig = configs.prefixed("xapix-foley-frontend");
  const backendConfig = configs.prefixed("xapix-foley-backend");

  const domain = config.require("domain");
  const frontendMemoryMB = frontendConfig.requireNumber("require-memory");
  const backendMemoryMB = backendConfig.requireNumber("require-memory");

  const uri = pulumi.interpolate `mongodb://${mongo.dbUsername}:${mongo.dbPassword}@${mongo.hostname}:27017/${mongo.dbName}`;

  const env = pulumi.all([uri, mongo.hostname])
    .apply(([uri, hostname]) => makeEnvVars(domain, uri, hostname));

  const backendService = new k8s.core.v1.Service("foley-backend", {
    metadata: {
      name: "foley-backend",
      namespace,
    },
    spec: {
      type: "ClusterIP",
      ports: [
        {
          name: "http",
          port: 80,
          protocol: "TCP",
          targetPort: 3000,
        },
      ],
      selector: selectorLabels,
    },
  }, { provider });

  const frontendService = new k8s.core.v1.Service("foley-frontend", {
    metadata: {
      name: "foley-frontend",
      namespace,
    },
    spec: {
      type: "ClusterIP",
      ports: [
        {
          name: "http",
          port: 80,
          protocol: "TCP",
          targetPort: 8080,
        },
      ],
      selector: selectorLabels,
    },
  }, { provider });

  new k8s.apps.v1.Deployment(`foley-${stack}`,
    {
      metadata: { namespace },
      spec: {
        replicas: 1,
        selector: { matchLabels: selectorLabels },
        template: {
          metadata: { labels: selectorLabels },
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

  new k8s.extensions.v1beta1.Ingress(`foley-${stack}-ingress`, {
    metadata: {
      namespace,
      annotations: {
        // This annotation tells externalDNS to create the record
        "external-dns.alpha.kubernetes.io/hostname": domain,
        // This annotation tells cert-manager what issuer to use for TLS
        // [AGREEMENT]: we assume that cert-manager with this issuer is deployed on the referred cluster
        "cert-manager.io/cluster-issuer": "letsencrypt-prod"
      }
    },
    spec: {
      tls: [{
        hosts: [domain],
        secretName: `foley-${stack}-tls`
      }],
      rules: [{
        host: domain,
        http: {
          paths: [{
            path: "/api",
            backend: {
              serviceName: backendService.metadata.name,
              servicePort: "http"
            }
          }, {
            path: "/",
            backend: {
              serviceName: frontendService.metadata.name,
              servicePort: "http"
            }
          }]
        }
      }]
    }
  }, { provider });
};
