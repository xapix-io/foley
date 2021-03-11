import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";
import * as xapix from "@xapix-io/infra-utils";
import configs from "./config";
import foley from "./components/foley";
import mongodb from "./components/mongodb";

const version = xapix.env.req("VERSION");
const stack = pulumi.getStack();

const coreConfig = configs.prefixed("core");
const coreStack = new pulumi.StackReference(coreConfig.require("stack-ref"));
const kubeconfig = coreStack.requireOutput("kubeconfig");
const provider = new k8s.Provider(`core-${stack}-provider`, { kubeconfig });

const appsnsConfig = configs.prefixed("appsns");
const appsnsStackRef = new pulumi.StackReference(
  appsnsConfig.require("appsns-stack-ref")
);
const appsNs = appsnsStackRef.requireOutput("appsNs");

const mongo = mongodb({
  provider,
  namespace: appsNs,
});

const ingress = foley({
  mongo,
  provider,
  namespace: appsNs,
  version,
});

const endpoints = ingress.status.loadBalancer.ingress
  .apply(ingresses => ingresses.map(x => x.ip || x.hostname));

export { endpoints };
