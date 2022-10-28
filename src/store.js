import { reactive } from "vue";
export const store = reactive({
  theme: "light",
  toggleTheme() {
    this.theme = this.theme === "light" ? "dark" : "light";
  },
});
