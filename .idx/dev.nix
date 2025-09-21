{ pkgs, ... }: {
  # The nixpkgs channel to use.
  channel = "stable-24.05";

  # A list of packages to have available in your environment.
  packages = [
    pkgs.nodejs_20 # Use a specific version of Node.js
  ];

  # VS Code extensions and workspace settings.
  idx = {
    extensions = [
      "dbaeumer.vscode-eslint"
    ];
    workspace = {
      # Runs when a workspace is first created.
      onCreate = {
        npm-install = "npm install";
      };
    };
    # Configures the web preview for your application.
    previews = {
      enable = true;
      previews = {
        web = {
          # The command to start the web server.
          # The $PORT environment variable is automatically injected by the preview service.
          command = ["npm" "run" "dev"];
          manager = "web";
        };
      };
    };
  };
}
