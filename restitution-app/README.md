# restitution-app

## Local Development

### Pre-reqs

- Node 12.x
- npm 6.x

#### For those using [NVM](https://github.com/nvm-sh/nvm)

```bash
nvm install 12.22.12
nvm use 12.22.12
```

## Running the application locally

### NPM Install

From the `restitution-app/ClientApp` folder

```
npm install
```

### DotNet Secrets

[Setup secrets](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets?view=aspnetcore-9.0&tabs=windows#secret-manager)

### Start the app

#### Backend

From the `restitution-app` folder.

```bash
dotnet run
```

The backend should now be available at `localhost:4200/api`.

#### Frontend

From the `restitution-app/ClientApp` folder.

```bash
npm start
```

The frontend should now be available at `localhost:4200`.