#/bin/sh

typedoc --module commonjs --excludeNotExported --excludePrivate --ignoreCompilerErrors --mode file --theme markdown --out 'docs/api/core' 'packages/core/src' && \
typedoc --module commonjs --excludeNotExported --excludePrivate --ignoreCompilerErrors --mode file --theme markdown --out 'docs/api/di' 'packages/di/src' && \
yarn replace-in-file "/\.md\)/g" ")" "./docs/api/**/*.md" --isRegex && \
yarn replace-in-file "/\.md#/g" "#" "./docs/api/**/*.md" --isRegex
