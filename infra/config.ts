import { Configuration, PropType } from "@xapix-io/infra-utils"

const config = new Configuration({
  core: {
    "stack-ref": {
      required: true,
      type: PropType.STRING,
      description: 'Reference to core k8s pulumi stack. Must have `kubeconfig` output.'
    }
  },
  appsns: {
    "appsns-stack-ref": {
      required: true,
      type: PropType.STRING,
      description: 'Reference to appsns pulumi stack. Must have `appsNs` output.'
    }
  },
  "xapix-foley": {
     "domain-base": {
      required: true,
      type: PropType.STRING,
      description: "Domain under which all the Clojud services (api, internal, executor) will be created as a subdomains. So if `domain-base` is `clojud.com` than api endpoint will appear at `api.clojud.com`"
    },
    "require-memory": {
      required: true,
      type: PropType.NUMBER,
      description: "How many megabytes of memory should be reserved for each Clojud Pod"
    },
    "require-cpu": {
      required: true,
      type: PropType.STRING,
      description: "How many CPU units should be reserved for each Clojud Pod"
    },
    "replicas": {
      type: PropType.NUMBER,
      description: "Number of Clojud instances to deploy",
      default: 1
    },

  }
});

export default config;

if (require.main === module) {
  config.generateDoc("docs/config.md")
}
