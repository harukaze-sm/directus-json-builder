<template>
  <div class="grid">
    <div class="grid-element full">
      <p class="type-label">{{ t("interfaces.list.edit_fields") }}</p>
      <interface-list
        :value="repeaterValue"
        :fields="repeaterFields"
        @input="repeaterValue = $event"
        :template="`{{ field }} — {{ interface }}`"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { useI18n } from "vue-i18n";
import { defineComponent, PropType, computed } from "vue";
import { Field, FieldMeta, DeepPartial } from "@directus/shared/types";
import { FIELD_TYPES_SELECT } from "./constants";

export default defineComponent({
  props: {
    value: {
      type: Object as PropType<Record<string, any>>,
      default: null,
    },
  },
  emits: ["input"],
  setup(props, { emit }) {
    const { t } = useI18n();

    const repeaterValue = computed({
      get() {
        return props.value?.fields?.map((field: Field) => field.meta);
      },
      set(newVal: FieldMeta[] | null) {
        const fields = (newVal || []).map((meta: Record<string, any>) => ({
          field: meta.field,
          name: meta.name || meta.field,
          type: meta.type,
          meta,
        }));

        emit("input", {
          ...(props.value || {}),
          fields: fields,
        });
      },
    });

    const repeaterFields: DeepPartial<Field>[] = [
      {
        name: t("field", 1),
        field: "field",
        type: "string",
        meta: {
          interface: "input",
          width: "half",
          sort: 2,
          options: {
            dbSafe: true,
            font: "monospace",
            placeholder: t("interfaces.list.field_name_placeholder"),
          },
        },
        schema: null,
      },
      {
        name: t("field_width"),
        field: "width",
        type: "string",
        meta: {
          interface: "select-dropdown",
          width: "half",
          sort: 3,
          options: {
            choices: [
              {
                value: "half",
                text: t("half_width"),
              },
              {
                value: "full",
                text: t("full_width"),
              },
            ],
          },
        },
        schema: null,
      },
      {
        name: t("type"),
        field: "type",
        type: "string",
        meta: {
          interface: "select-dropdown",
          width: "half",
          sort: 4,
          options: {
            choices: FIELD_TYPES_SELECT,
          },
        },
        schema: null,
      },
      {
        name: t("interface_label"),
        field: "interface",
        type: "string",
        meta: {
          interface: "system-interface",
          width: "half",
          sort: 5,
          options: {
            typeField: "type",
          },
        },
        schema: null,
      },
      {
        name: t("note"),
        field: "note",
        type: "string",
        meta: {
          interface: "system-input-translated-string",
          width: "full",
          sort: 6,
          options: {
            placeholder: t("interfaces.list.field_note_placeholder"),
          },
        },
        schema: null,
      },
      {
        name: t("options"),
        field: "options",
        type: "string",
        meta: {
          interface: "system-interface-options",
          width: "full",
          sort: 7,
          options: {
            interfaceField: "interface",
          },
        },
      },
    ];

    return { t, repeaterValue, repeaterFields };
  },
});
</script>

<style lang="scss" scoped>
.grid {
  display: grid;
  grid-template-columns: [start] minmax(0, 1fr) [half] minmax(0, 1fr) [full];
  gap: var(--form-vertical-gap) var(--form-horizontal-gap);

  &.with-fill {
    grid-template-columns:
      [start] minmax(0, var(--form-column-max-width)) [half] minmax(
        0,
        var(--form-column-max-width)
      )
      [full] 1fr [fill];
  }

  .type-label {
    margin-bottom: 8px;
  }

  .field {
    grid-column: start / fill;

    @media (min-width: 960px) {
      grid-column: start / full;
    }
  }

  .half,
  .half-left,
  .half-space {
    grid-column: start / fill;

    @media (min-width: 960px) {
      grid-column: start / half;
    }
  }

  .half + .half,
  .half-right {
    grid-column: start / fill;

    @media (min-width: 960px) {
      grid-column: half / full;
    }
  }

  .full {
    grid-column: start / fill;

    @media (min-width: 960px) {
      grid-column: start / full;
    }
  }

  .fill {
    grid-column: start / fill;
  }

  &-element {
    &.full {
      grid-column: start/full;
    }
  }
}
</style>
