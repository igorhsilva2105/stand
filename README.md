# stand
Armazém para projetos temporarios

anotação temporaria
```
// Criar
chrome.storage.local.set({ user: { name: "Ana", age: 30 } });

// Ler
chrome.storage.local.get("user", (result) => {
  console.log(result.user);
});

// Atualizar
chrome.storage.local.get("user", (result) => {
  let user = result.user;
  user.age = 31;
  chrome.storage.local.set({ user });
});

// Deletar
function delet() {
  chrome.storage.local.remove("user");
}



function categoriaCreate(name) {
  chorome.storage.local.set(`${name}`)
}
```
