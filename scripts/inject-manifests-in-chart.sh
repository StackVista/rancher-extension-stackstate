# - add manifests/ to all charts under charts/
# - package these charts
#!/usr/bin/env bash

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
BASE_DIR="$(pwd)"

ASSETS=$BASE_DIR/assets
CHARTS=$BASE_DIR/charts

pushd $CHARTS
for d in */ ; do
  pkg=$(basename $d)
  echo "Extending $pkg"
  for version in $pkg/* ; do
    cp -r $BASE_DIR/manifests/* $version/templates/
    helm package $version -d ${ASSETS}/$pkg
  done
done
popd

cp -r $ASSETS/* $BASE_DIR/tmp/assets
cp -r $CHARTS/* $BASE_DIR/tmp/charts
