<template>
  <v-notice v-if="isEmpty(internalValue) || internalValue == null">
    No Item
  </v-notice>
  <v-notice v-else-if="typeof internalValue !== 'object'" type="warning">
    <p>{{ t("interfaces.list.incompatible_data") }}</p>
  </v-notice>

  <v-list v-if="!isEmpty(internalValue)">
    <v-list-item block @click="openItem()">
      <template #item="{ element, _index }">
        <render-template
          :fields="fields"
          :item="{ ...defaults, ...element }"
          :template="templateWithDefaults"
        />
      </template>
      <div class="spacer" />
    </v-list-item>
  </v-list>

  <v-button v-if="isEmpty(internalValue)" class="add-new" @click="addNew">
    Add New
  </v-button>

  <v-drawer
    :model-value="drawerOpen"
    :title="t('empty_item')"
    persistent
    @update:model-value="checkDiscard()"
    @cancel="checkDiscard()"
  >
    <template #title>
      <h1 class="type-title">
        <render-template
          :fields="fields"
          :item="activeItem"
          :template="templateWithDefaults"
        />
      </h1>
    </template>

    <template #actions>
      <v-button
        v-tooltip.bottom="t('save')"
        icon
        rounded
        @click="saveItem(active ? active : 0)"
      >
        <v-icon name="check" />
      </v-button>
    </template>

    <div class="drawer-item-content">
      <v-form
        :fields="fieldsWithNames"
        :model-value="activeItem"
        autofocus
        primary-key="+"
        @update:model-value="trackEdits($event)"
      />
    </div>
  </v-drawer>

  <v-dialog v-model="confirmDiscard" @esc="confirmDiscard = false">
    <v-card>
      <v-card-title>{{ t("unsaved_changes") }}</v-card-title>
      <v-card-text>{{ t("unsaved_changes_copy") }}</v-card-text>
      <v-card-actions>
        <v-button secondary @click="discardAndLeave()">
          {{ t("discard_changes") }}
        </v-button>
        <v-button @click="confirmDiscard = false">{{
          t("keep_editing")
        }}</v-button>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { useI18n } from "vue-i18n";
import { defineComponent, PropType, computed, toRefs, ref } from "vue";
import { Field } from "@directus/shared/types";
import { isEqual, isEmpty } from "lodash";

export default defineComponent({
  props: {
    value: {
      type: Object as PropType<Record<string, any>[]>,
      default: () => [],
    },
    fields: {
      type: Array as PropType<Partial<Field>[]>,
      default: () => [],
    },
  },
  emits: ["input"],
  setup(props, { emit }) {
    const active = ref<number | null>(null);
    const confirmDiscard = ref(false);
    const edits = ref({});
    const isNewItem = ref(false);
    const drawerOpen = computed(() => active.value !== null);
    const activeItem = computed(() =>
      active.value !== null ? edits.value : null
    );
    const { value } = toRefs(props);
    const { t } = useI18n();

    const internalValue = computed({
      get: () => {
        return value.value;
      },
      set: (newVal) => {
        value.value = newVal;
      },
    });

    const showAddNew = Object.keys(internalValue).length;

    function openItem() {
      isNewItem.value = false;

      edits.value = { ...internalValue.value };
      active.value = 0;
    }

    function checkDiscard() {
      if (
        active.value !== null &&
        !isEqual(edits.value, internalValue.value[active.value])
      ) {
        confirmDiscard.value = true;
      } else {
        closeDrawer();
      }
    }

    function closeDrawer() {
      if (isNewItem.value) {
        emitValue(internalValue.value.slice(0, -1));
      }

      edits.value = {};
      active.value = null;
    }

    function emitValue(value: null | any) {
      return emit("input", { ...value });
    }

    function addNew() {
      isNewItem.value = true;

      const newDefaults: any = {};

      props.fields.forEach((field) => {
        newDefaults[field.field!] = field.schema?.default_value
          ? field.schema?.default_value
          : null;
      });

      emitValue(newDefaults);

      edits.value = { ...newDefaults };
      active.value = 0;
    }

    const defaults = computed(() => {
      const values: Record<string, any> = {};

      for (const field of props.fields) {
        if (
          field.schema?.default_value !== undefined &&
          field.schema?.default_value !== null
        ) {
          values[field.field!] = field.schema.default_value;
        }
      }

      return values;
    });

    function trackEdits(updatedValues: any) {
      const combinedValues = Object.assign({}, defaults.value, updatedValues);
      Object.assign(edits.value, combinedValues);
    }

    const fieldsWithNames = computed(() =>
      props.fields?.map((field) => {
        return {
          ...field,
          name: field.name,
        };
      })
    );

    const templateWithDefaults = computed(() =>
      props.fields?.[0]?.field ? `{{${props.fields[0].field}}}` : ""
    );

    function saveItem(index: number) {
      isNewItem.value = false;

      updateValues(index, edits.value);
      closeDrawer();
    }

    function updateValues(_: number, updatedValues: any) {
      emitValue(updatedValues);
    }

    function discardAndLeave() {
      closeDrawer();
      confirmDiscard.value = false;
    }

    console.error(props.fields[0].field);

    return {
      internalValue,
      showAddNew,
      t,
      checkDiscard,
      addNew,
      drawerOpen,
      trackEdits,
      fieldsWithNames,
      activeItem,
      templateWithDefaults,
      saveItem,
      active,
      confirmDiscard,
      discardAndLeave,
      openItem,
      defaults,
      isEmpty,
    };
  },
});
</script>

<style lang="scss" scoped>
.v-notice {
  margin-bottom: 4px;
}

.v-list {
  --v-list-padding: 0 0 4px;
}

.v-list-item {
  display: flex;
  cursor: pointer;
}

.drag-handle {
  cursor: grap;
}

.drawer-item-content {
  padding: var(--content-padding);
  padding-bottom: var(--content-padding-bottom);
}

.add-new {
  margin-top: 8px;
}
</style>
