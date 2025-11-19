const STORAGE_KEY = 'BOOKSHELF_APPS';
let books = []; 

/**
 * Memastikan browser mendukung localStorage
 * @returns {boolean}
 */
function isStorageExist() {
  if (typeof (Storage) === undefined) {
    console.error('Browser Anda tidak mendukung Local Storage.');
    return false;
  }
  return true;
}

/**
 * Menyimpan data books ke localStorage
 */
function saveBookData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event('onbookschanged'));
  }
}

/**
 * Memuat data buku dari localStorage
 */
function loadBookData() {
  if (isStorageExist()) {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
      books = data;
    }
    document.dispatchEvent(new Event('onbookschanged'));
  }
}

/**
 * Membuat ID unik menggunakan timestamp
 * @returns {number}
 */
function generateId() {
  return Number(new Date());
}

/**
 * Membuat objek buku baru dari data form
 * @param {string} title
 * @param {string} author
 * @param {number} year
 * @param {boolean} isComplete
 * @returns {object}
 */
function makeNewBookObject(title, author, year, isComplete) {
  return {
    id: generateId(),
    title: title,
    author: author,
    year: year,
    isComplete: isComplete,
  };
}

/**
 * Menambahkan buku baru ke array dan menyimpannya
 * @param {object} bookObject
 */
function addBook(bookObject) {
  books.push(bookObject);
  saveBookData();
}

/**
 * Memindahkan buku antar rak (mengubah status isComplete)
 * @param {number | string} bookId
 */
function moveBook(bookId) {
  const bookIndex = findBookIndex(bookId);

  if (bookIndex === -1) {
    return;
  }
  books[bookIndex].isComplete = !books[bookIndex].isComplete;
  saveBookData();
}

/**
 * Menghapus buku dari array
 * @param {number | string} bookId
 */
function deleteBook(bookId) {
  const bookIndex = findBookIndex(bookId);

  if (bookIndex === -1) {
    return;
  }
  books.splice(bookIndex, 1);
  saveBookData();
}

/**
 * Mengedit detail buku yang sudah ada
 * @param {number | string} id
 * @param {string} title
 * @param {string} author
 * @param {number} year
 * @param {boolean} isComplete
 */
function editBook(id, title, author, year, isComplete) {
    const bookIndex = findBookIndex(id);

    if (bookIndex === -1) {
        return;
    }
    books[bookIndex].title = title;
    books[bookIndex].author = author;
    books[bookIndex].year = year;
    books[bookIndex].isComplete = isComplete;
    saveBookData();
}

/**
 * Mencari index buku berdasarkan ID
 * @param {number | string} bookId
 * @returns {number} Index buku, atau -1 jika tidak ditemukan
 */
function findBookIndex(bookId) {
  const idToFind = Number(bookId);
  return books.findIndex(book => book.id === idToFind);
}

/**
 * Mencari objek buku berdasarkan ID
 * @param {number | string} bookId
 * @returns {object | null} Objek buku atau null jika tidak ditemukan
 */
function findBook(bookId) {
    const idToFind = Number(bookId);
    return books.find(book => book.id === idToFind) || null;
}

/**
 * Mencetak objek buku menjadi elemen HTML
 * @param {object} bookObject
 * @returns {HTMLElement}
 */
function makeBookElement(bookObject) {
  const { id, title, author, year, isComplete } = bookObject;
  const bookId = id.toString();
  const container = document.createElement('div');
  container.setAttribute('data-bookid', bookId);
  container.setAttribute('data-testid', 'bookItem');

  if (isComplete) {
      container.classList.add('complete');
  }
  const titleElement = document.createElement('h3');
  titleElement.setAttribute('data-testid', 'bookItemTitle');
  titleElement.innerText = title;

  const authorElement = document.createElement('p');
  authorElement.setAttribute('data-testid', 'bookItemAuthor');
  authorElement.innerText = `Penulis: ${author}`;

  const yearElement = document.createElement('p');
  yearElement.setAttribute('data-testid', 'bookItemYear');
  yearElement.innerText = `Tahun: ${year}`;
  
  const buttonContainer = document.createElement('div');
  const moveButton = document.createElement('button');
  moveButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
  moveButton.innerText = isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca';
  moveButton.addEventListener('click', function() {
    moveBook(bookId);
  });

  const deleteButton = document.createElement('button');
  deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
  deleteButton.innerText = 'Hapus Buku';
  deleteButton.addEventListener('click', function() {

    if (confirm(`Apakah Anda yakin ingin menghapus buku "${title}"?`)) {
        deleteBook(bookId);
    }
  });
  
  const editButton = document.createElement('button');
  editButton.setAttribute('data-testid', 'bookItemEditButton');
  editButton.innerText = 'Edit Buku';
  editButton.addEventListener('click', function() {
    openEditModal(id);
  });
  
  buttonContainer.append(moveButton, deleteButton, editButton);
  container.append(titleElement, authorElement, yearElement, buttonContainer);
  return container;
}

/**
 * Merender (menampilkan) semua buku ke rak yang sesuai
 * @param {Array<object>} bookData - Data buku yang akan ditampilkan (bisa hasil filter/search)
 */
function renderBooks(bookData = books) {
  const incompleteList = document.getElementById('incompleteBookList');
  const completeList = document.getElementById('completeBookList');
  incompleteList.innerHTML = '';
  completeList.innerHTML = '';
  let incompleteCount = 0;
  let completeCount = 0;

  for (const book of bookData) {
    const bookElement = makeBookElement(book);

    if (book.isComplete) {
      completeList.append(bookElement);
      completeCount++;
    } else {
      incompleteList.append(bookElement);
      incompleteCount++;
    }
  }
  
  if (incompleteCount === 0) {
      const p = document.createElement('p');
      p.classList.add('empty-message');
      p.innerText = 'Rak ini kosong. Tambahkan buku baru!';
      incompleteList.append(p);
  }

  if (completeCount === 0) {
      const p = document.createElement('p');
      p.classList.add('empty-message');
      p.innerText = 'Rak ini kosong. Baca buku sampai selesai!';
      completeList.append(p);
  }
}

/**
 * Setup untuk form Tambah Buku
 */
function setupAddBookForm() {
  const form = document.getElementById('bookForm');
  const isCompleteCheckbox = document.getElementById('bookFormIsComplete');
  const submitButtonText = form.querySelector('#bookFormSubmit span');

  isCompleteCheckbox.addEventListener('change', function() {
    if (this.checked) {
      submitButtonText.innerText = 'Selesai dibaca';
    } else {
      submitButtonText.innerText = 'Belum selesai dibaca';
    }
  });

  form.addEventListener('submit', function(event) {
    event.preventDefault();
    const title = document.getElementById('bookFormTitle').value;
    const author = document.getElementById('bookFormAuthor').value;
    const year = Number(document.getElementById('bookFormYear').value); 
    const isComplete = isCompleteCheckbox.checked;
    const newBook = makeNewBookObject(title, author, year, isComplete);
    addBook(newBook);
    form.reset();
    submitButtonText.innerText = 'Belum selesai dibaca'; 
  });
}

/**
 * Setup untuk form Pencarian Buku
 */
function setupSearchForm() {
    const searchForm = document.getElementById('searchBook');
    const searchInput = document.getElementById('searchBookTitle');
    searchForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const query = searchInput.value.toLowerCase().trim();
        
        if (query === '') {
            renderBooks(); 
            return;
        }

        const searchResults = books.filter(book => 
            book.title.toLowerCase().includes(query)
        );
        
        renderBooks(searchResults);

        if (searchResults.length === 0) {
            alert(`Tidak ditemukan buku dengan judul "${searchInput.value}"`);
        }
    });

    searchInput.addEventListener('keyup', function() {
        if (this.value.trim() === '') {
            renderBooks();
        }
    });
}

/**
 * Setup untuk Modal Edit
 * @param {number | string} bookId
 */
function openEditModal(bookId) {
    const modal = document.getElementById('editModal');
    const bookToEdit = findBook(bookId);

    if (!bookToEdit) {
        alert('Buku tidak ditemukan untuk diedit.');
        return;
    }

    document.getElementById('editBookId').value = bookToEdit.id;
    document.getElementById('editTitle').value = bookToEdit.title;
    document.getElementById('editAuthor').value = bookToEdit.author;
    document.getElementById('editYear').value = bookToEdit.year;
    document.getElementById('editIsComplete').checked = bookToEdit.isComplete;
    modal.classList.remove('hidden');
}

/**
 * Setup form edit buku dan tombol batal
 */
function setupEditForm() {
    const editForm = document.getElementById('editForm');
    const modal = document.getElementById('editModal');
    const cancelButton = document.getElementById('cancelEdit');
    cancelButton.addEventListener('click', function() {
        modal.classList.add('hidden');
    });

    editForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const id = document.getElementById('editBookId').value;
        const title = document.getElementById('editTitle').value;
        const author = document.getElementById('editAuthor').value;
        const year = Number(document.getElementById('editYear').value);
        const isComplete = document.getElementById('editIsComplete').checked;
        editBook(id, title, author, year, isComplete);
        modal.classList.add('hidden');
    });
}

document.addEventListener('DOMContentLoaded', function() {
  loadBookData();
  setupAddBookForm();
  setupSearchForm();
  setupEditForm();
  renderBooks();
});
