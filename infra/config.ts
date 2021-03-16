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
            description: 'Reference to appsns pulumi stack. Must have `appsNs` output.',
        },
    },
    "xapix-foley-common": {
        "domain": {
            required: true,
            type: PropType.STRING,
            description: "Domain under which the foley app will be accessed.",
        },
    },
    "xapix-foley-backend": {
        "require-memory": {
            required: true,
            type: PropType.NUMBER,
            description: "How many MiB of memory should be reserved for each foley backend container",
        },
        "require-cpu": {
            required: true,
            type: PropType.STRING,
            description: "How many CPU units should be reserved for each foley backend container",
        },
    },
    "xapix-foley-frontend": {
        "require-memory": {
            required: true,
            type: PropType.NUMBER,
            description: "How many MiB of memory should be reserved for each foley frontend container",
        },
        "require-cpu": {
            required: true,
            type: PropType.STRING,
            description: "How many CPU units should be reserved for each foley frontend container",
        },
    },
});

export default config;

if (require.main === module) {
    config.generateDoc("docs/config.md")
}
