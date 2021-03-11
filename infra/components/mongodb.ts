import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";
import * as random from "@pulumi/random";

export default function ({
  provider,
  namespace,
}: {
  provider: k8s.Provider;
  namespace: pulumi.Input<string>;
}) {
  const stack = pulumi.getStack();
  const dbUsername = "foley";
  const dbName = "playgrounds";
  const pwdConfig = {
    length: 16,
    special: true,
    overrideSpecial: "-_",
  };
  const dbPassword = new random.RandomPassword(`foley-${stack}-db-pw`, pwdConfig);
  const dbRootPassword = new random.RandomPassword(`foley-${stack}-db-root-pw`, pwdConfig);

  new k8s.helm.v3.Chart(`${stack}-mongo`, {
    chart: "mongodb",
    namespace,
    fetchOpts: {
      repo: "https://charts.bitnami.com/bitnami",
    },
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

  const hostname = `${stack}-mongo-mongodb`;
  return pulumi.all([dbPassword, dbRootPassword])
    .apply(([dbPW, rootPW]) => {
      return {
        dbName,
        dbUsername,
        dbPassword: dbPW.result,
        dbRootPassword: rootPW.result,
        hostname
      }
    });
}
