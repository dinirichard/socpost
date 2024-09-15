---
title: NX intro
---
### Build, test and lint your app

```
# Build
nx build 
# Test
nx test 
# Lint
nx lint 
# Run them together!
nx run-many -t build test lint
```

## View project details

```
nx show project client
```

### View interactive project graph

```
nx graph
```

### Add UI library

```
# Generate UI lib
nx g @nx/angular:lib ui
# Add a component
nx g @nx/angular:component ui/src/lib/button
```

&nbsp;

<SwmMeta version="3.0.0" repo-id="Z2l0aHViJTNBJTNBc29jcG9zdCUzQSUzQWRpbmlyaWNoYXJk" repo-name="socpost"><sup>Powered by [Swimm](https://app.swimm.io/)</sup></SwmMeta>
