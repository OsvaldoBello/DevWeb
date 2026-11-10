FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY app/backend/ app/backend/
RUN dotnet publish app/backend/PainelEnade.Api.csproj -c Release -o /srv/app/backend

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /srv/app/backend
COPY --from=build /srv/app/backend /srv/app/backend
COPY banco /srv/banco
COPY app/uploads /srv/app/uploads
EXPOSE 10000
CMD ["sh", "-c", "dotnet PainelEnade.Api.dll --urls http://0.0.0.0:${PORT:-10000}"]
