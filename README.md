# comet-brevo-module

> [!CAUTION]
> **This repository is archived and no longer maintained.**
>
> The packages have been moved to the main [Dextinity](https://github.com/vivid-planet/dextinity) repository (formerly COMET).
>
> | Package          | New location                                                                                                                        |
> | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
> | `brevo-admin`    | [vivid-planet/dextinity/packages/admin/brevo-admin](https://github.com/vivid-planet/dextinity/tree/main/packages/admin/brevo-admin) |
> | `brevo-api`      | [vivid-planet/dextinity/packages/api/brevo-api](https://github.com/vivid-planet/dextinity/tree/main/packages/api/brevo-api)         |
> | `mail-rendering` | [vivid-planet/dextinity/packages/mail-react](https://github.com/vivid-planet/dextinity/tree/main/packages/mail-react)               |

---

## Getting started

### Prerequisites

The following tools need to be installed on your local machine.

-   [Docker Desktop](https://www.docker.com/products/docker-desktop/)
-   [nvm](https://github.com/nvm-sh/nvm)

### Setup workspace

Run the `install.sh` script to install dependencies and setup needed symlinks.

```bash
sh install.sh
```

_It is recommended to run `install.sh` every time you switch to the `main` branch._

### Define your contact attributes in the brevo module's config

The attribute naming must be identical to the naming in brevo

### Set environment variables

The following variables must be set manually

-   `BREVO_API_KEY`
-   `ECG_RTR_LIST_API_KEY`
-   `CAMPAIGN_BASIC_AUTH_USERNAME`
-   `CAMPAIGN_BASIC_AUTH_PASSWORD`

### Configure brevo sender in the demo admin brevo config page

-   Brevo sender
-   Brevo double opt-in template

### Start development processes

[dev-process-manager](https://github.com/vivid-planet/dev-process-manager) is used for local development.

#### Start Demo

```bash
pnpm run dev:demo
```

Demo will be available at

-   Admin: [http://localhost:8000/](http://localhost:8000/)
-   API: [http://localhost:4000/](http://localhost:4000/)
-   Site: [http://localhost:3000/](http://localhost:3000/)

It is also possbile to start specific microservices

```bash
pnpm run dev:demo:api # (api|admin|site)
```

The docs will be available at [http://localhost:3000/](http://localhost:3000/)

### Stop Processes

```bash
npx dev-pm shutdown
```

## Uninstallation

    // Removes docker volumes and all files and folder which are not managed in the repo (node_modules, lib,...)
    // If you want to reset your development environment totally, run this command and ./install.sh afterwards.

    ./uninstall.sh
