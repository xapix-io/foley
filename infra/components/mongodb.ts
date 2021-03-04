import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";
import * as random from "@pulumi/random";
import * as xapix from "@xapix-io/infra-utils";
import configs from "../config";

export default function ({
  provider,
  namespace,
}: {
  provider: k8s.Provider;
  namespace: pulumi.Output<string>;
}) {
  const stack = pulumi.getStack();
  const dbUsername = "foley";
  const dbName = "playgrounds";
  const dbPassword = new random.RandomPassword(`foley-${stack}-db-pw`, {
    length: 16,
    special: true,
  });
  const dbRootPassword = new random.RandomPassword(
    `foley-${stack}-db-root-pw`,
    {
      length: 16,
      special: true,
    }
  );

  const mongoChart = new k8s.helm.v3.Chart(
    `${stack}-mongo`,
    {
      chart: "mongodb",
      repo: "bitnami",
      namespace,
      fetchOpts: {
        repo: "https://charts.bitnami.com/bitnami",
      },
      resourcePrefix: `${stack}`,
      values: {
        architecture: "standalone",
        auth: {
          enabled: true,
          rootPassword: dbRootPassword.result,
          username: dbUsername,
          password: dbPassword.result,
          database: dbName,
        },
        service: {
          type: "ClusterIP",
          port: 27017,
          nameOverride: `foley-${stack}-mongodb`,
        },
        metrics: {
          serviceMonitor: {
            enabled: true,
          },
        },
      },
    },
    { provider }
  );

  const mongo = mongoChart.getResourceProperty("v1/Service", `${stack}-mongo`, "spec");

  return pulumi.concat(
    "mongodb://", dbUsername, ":", dbPassword, "@", mongo.clusterIP, ":27017/playgrounds"
  );
}
