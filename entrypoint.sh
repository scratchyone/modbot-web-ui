#!/bin/sh

# replace /__ENTRYPOINT__ with the runtime-configured entrypoint
if [ "$NEXT_PUBLIC_ENTRYPOINT" = "" ]; then
    # root entrypoint is handled differently from non-root, in particular
    #  - basePath="" rather than "/"
    #  - an extra redirect is added /x/ => /x -- but with root that would be // => / which is invalid
    cp .next/routes-manifest.json .next/routes-manifest.json.in
    jq -rc '.basePath = ""
    | .redirects = [
        .redirects
        | .[]
        | select((.source == "/__ENTRYPOINT__/" and .destination == "/__ENTRYPOINT__") | not)
      ]' .next/routes-manifest.json.in >.next/routes-manifest.json
fi
# first we look for /__ENTRYPOINT__/ -- this should become / in the case of empty entrypoint
#  then we look for /__ENTRYPOINT__ -- this should become "" in the case of empty entrypoint
find .next \
    -type f \
    -exec sed -i \
    -e "s#/__ENTRYPOINT__/#${NEXT_PUBLIC_ENTRYPOINT}/#g" \
    -e "s#/__ENTRYPOINT__#${NEXT_PUBLIC_ENTRYPOINT}#g" \
    {} +

$@
