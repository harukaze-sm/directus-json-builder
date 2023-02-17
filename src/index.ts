import { defineInterface } from "@directus/extensions-sdk";
import InterfaceComponent from "./component.vue";
import Options from "./options.vue";

export default defineInterface({
  id: "custom-json",
  name: "JSON Builder",
  icon: "box",
  description: "Interface to implement json fields with any type of input.",
  component: InterfaceComponent,
  options: Options,
  types: ["json"],
});
