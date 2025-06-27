export class WhitespaceBuffer {
  value = "";

  set(str: string) {
    this.value = str;
  }

  append(str: string) {
    this.value += str;
  }

  retrieve() {
    const out = this.value;
    this.value = "";
    return out;
  }

  clear() {
    this.value = "";
  }
}
