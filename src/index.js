document.addEventListener("DOMContentLoaded", () => {
    let quoteId;
    const list = document.querySelector("#quote-list");
    let onOff = false;
    const form = document.querySelector("#new-quote-form");
    const sort = document.createElement("div");
    const sortBtn = document.createElement("button");
    sort.innerText = "Sort by author:";
    sortBtn.innerText = "Off";
    document.querySelector("h1").appendChild(sort).appendChild(sortBtn);
  
    fetchQuote(onOff);
  
    sortBtn.addEventListener("click", () => {
      onOff = !onOff;
      list.innerHTML = "";
      if (sortBtn.innerText === "Off") {
        sortBtn.innerText = "On";
        fetchQuote(onOff);
      }
      else
      {
        sortBtn.innerText = "Off";
        fetchQuote(onOff);
      }
      setTimeout(() => {
        managePage();
      }, 500);
    });
  
    form.addEventListener("submit", (eventFn) => {
      eventFn.preventDefault();
      const newQuote = document.querySelector("#new-quote");
      const newAuthor = document.querySelector("#author");
      const newQuoteObject = { quote: newQuote.value, author: newAuthor.value };
      postNewQuote(newQuoteObject);
      form.reset();
      location.reload();
    });
    setTimeout(() => {
      managePage();
    }, 500);
  });
  
  function managePage() {
    const block = document.getElementsByClassName("blockquote");
    Array.from(block).forEach((card) => {
      card.addEventListener("click", (eventFn) => {
        const card = eventFn.target.parentNode.parentNode;
        quoteId = parseInt(card.id);
        if (eventFn.target.className === "btn-danger") {
          eventFn.target.parentNode.parentNode.remove();
          deleteQuote(quoteId);
        } else if (eventFn.target.className === "btn-success") {
          const likeObject = { quoteId: quoteId };
          postLike(likeObject);
          eventFn.target.querySelector("span").innerText =
            parseInt(eventFn.target.querySelector("span").innerText) + 1;
        } else if (eventFn.target.className === "edit") {
          editQuote(eventFn, quoteId);
        }
      });
    });
  }
  
  function fetchQuote(onOff) {
    fetch("http://localhost:3000/quotes?_embed=likes")
      .then((response) => response.json())
      .then((data) => {
        let sortArray = data;
        if (onOff) {
          sortArray = Array.from(data).sort((a, b) => {
            if (a.author < b.author) {
              return -1;
            }
            if (a.author > b.author) {
              return 1;
            }
            return 0;
          });
        }
        else
        {
          sortArray = Array.from(data).sort((a, b) => {
            if (parseInt(a.id) < parseInt(b.id)) {
              return -1;
            }
            if (parseInt(a.id) > parseInt(b.id)) {
              return 1;
            }
            return 0;
          });
        }
        sortArray.forEach((quote) => {
          fetchLike(quote.id).then((likes) => listQuotes(quote, likes));
        });
      });
  }
  
  function listQuotes(quoteObject, likes = 0) {
    const list = document.querySelector("#quote-list");
    const quote = document.createElement("li");
    quote.className = "quote-card";
    quote.id = quoteObject.id;
    quote.innerHTML = `
                      <blockquote class ='blockquote'>
                          <p class='mb-0'>${quoteObject.quote}</p>
                          <footer class='blockquote-footer'>${quoteObject.author}</footer>
                          <br>
                          <button class='btn-success'>Likes: <span>${likes}</span></button>
                          <button class='btn-danger'>Delete</button>
                          <button class='edit'>Edit</button>
                      </blockquote>
                          `;
    list.appendChild(quote);
  }
  
  function postNewQuote(quoteObject) {
    fetch("http://localhost:3000/quotes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accepter: "application/json",
      },
      body: JSON.stringify(quoteObject),
    })
      .then((response) => response.json())
      .then((data) => listQuotes(data));
  }
  
  function deleteQuote(quoteId) {
    fetch(`http://localhost:3000/quotes/${quoteId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  
  function postLike(likeObject) {
    fetch("http://localhost:3000/likes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accepter: "application/json",
      },
      body: JSON.stringify(likeObject),
    });
  }
  
  function fetchLike(quoteId) {
    return fetch(`http://localhost:3000/likes?quoteId=${quoteId}`)
      .then((response) => response.json())
      .then((data) => data.length);
  }
  
  function editQuote(eventFn, quoteId) {
    const p = eventFn.target.parentNode.querySelector("p");
    const footer = eventFn.target.parentNode.querySelector("footer");
    if (eventFn.target.innerText === "Edit") {
      p.contentEditable = "true";
      p.focus();
      footer.contentEditable = "true";
      eventFn.target.innerText = "Done";
    } else {
      const updatedObject = {
        id: quoteId,
        quote: p.innerText,
        author: footer.innerText,
      };
      updateQuote(updatedObject);
      p.contentEditable = "false";
      footer.contentEditable = "false";
      eventFn.target.innerText = "Edit";
    }
  }
  
  function updateQuote(quoteObject) {
    fetch(`http://localhost:3000/quotes/${quoteObject.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accepter: "application/json",
      },
      body: JSON.stringify(quoteObject),
    });
  }