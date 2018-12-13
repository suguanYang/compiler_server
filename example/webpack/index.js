const TITLE = "Html";

document.querySelector("#app").innerHTML = `<h1>${TITLE}</h1>`;

const user = {
  set name(n) {
    this.name = n.toUpperCase();
  },
  get name() {
    return `My name is ${this.name}`;
  }
};


user.name = "tom";

document.querySelector("#user").innerHTML = `<p>${ user.name }<p>`;
document.querySelector("#user").innerHTML = `<p>${ user.name }<p>`;
