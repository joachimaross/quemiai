{ pkgs, ... }: {
  # The nixpkgs channel determines which package versions are available.
  # Joachima – All-in-One Social Media & Messaging Super App
  #
  # This environment provides the basic tools to start building the Joachima super app,
  # beginning with the core backend infrastructure and API architecture (Phase 1).

  channel = "stable-24.05";

  # A list of packages to install from the specified channel.
  # Adding lsof and psmisc provides helpful debugging tools (like fuser)
  # for dealing with port conflicts and process management.
  packages = [
    pkgs.nodejs_20    # A specific version of Node.js
    pkgs.lsof         # A utility to list open files and network connections
    pkgs.psmisc       # A set of tools for managing processes, including 'fuser'
    pkgs.openssh
  ];

  # Configuration for the Firebase Studio IDE.
  idx = {
    # A list of VS Code extensions to install from the Open VSX Registry.
    extensions = [
      "dbaeumer.vscode-eslint"
      "dbaeumer.vscode-eslint" # Integrates ESLint into VS Code.
      "esbenp.prettier-vscode" # Code formatter.
      "ms-vscode.vscode-typescript-next" # Preview TypeScript features.
      "rangav.vscode-thunder-client" # A lightweight REST API client.
    ];

    # Workspace lifecycle hooks.
    workspace = {
      # This command runs once when the workspace is first created.
      onCreate = {
        npm-install = "npm install";
      };
    };

    # Configures a web preview for your application.
    previews = {
      enable = true;
      previews = {
        web = {
          # This command starts your web server. The $PORT environment variable is
          # automatically assigned by Studio and passed to your application,
          # which your `src/index.ts` is now set up to use.
          command = ["npm" "run" "dev"];
          manager = "web";
        };
      };
    };
  };
}
