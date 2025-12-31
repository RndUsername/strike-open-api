# Strike API OpenAPI 3.0 Specification

This repository contains a complete OpenAPI 3.0 specification for the [Strike API](https://docs.strike.me/api/).

## Usage

You can download the latest version of the OpenAPI specification from the [release page](https://github.com/RndUsername/strike-open-api/releases) or use it directly via `https://github.com/RndUsername/strike-open-api/releases/download/{version}/strike-openapi.yaml`, where `{version}` is the release version, e.g. `v1.0.0`.

## How is the specification made?

Parts of the specification get crawled from the official documentation, after which it gets assembled and modified to get a complete specification file.

## Additional Resources

- [Strike API Documentation](https://docs.strike.me/api/)
- [Strike Dashboard](https://dashboard.strike.me)
- [Strike Support](mailto:support@strike.me)
- [API Terms](https://developer.strike.me/terms)
- [Privacy Policy](https://developer.strike.me/privacy)

## Contributing

This specification is based on the official Strike API documentation. If you find any discrepancies or have suggestions for improvements, please open an issue or submit a pull request.

Run `pnpm install` to setup the project and run `node src/main.ts --<version>` to create the spec, where `<version>` is the version that gets written into the spec. Use at least version 24 of Node.js as this is a TypeScript project.

## License

This OpenAPI specification is provided for integration purposes. Please refer to Strike's [API Terms](https://developer.strike.me/terms) for usage terms and conditions.