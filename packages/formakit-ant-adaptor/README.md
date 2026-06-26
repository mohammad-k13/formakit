# formakit-ant-adaptor

Ant Design adaptor plugin for `formakit`.

## Install

```bash
bun add formakit-ant-adaptor antd
```

## Usage

```tsx
import { FormBuilder, FormBuilderGlobalProvider } from "formakit";
import { antDesignAdaptor } from "formakit-ant-adaptor";

<FormBuilderGlobalProvider adaptor={{ designSystem: antDesignAdaptor }}>
  <FormBuilder config={formConfig} />
</FormBuilderGlobalProvider>;
```
