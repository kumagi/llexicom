function meaning_clicked(m) {
    const body = m.querySelector('.meaning-content');
    if (body) {
	body.classList.toggle("visible");
    }
    const title = m.querySelector('.meaning-title');
    console.log(title)
    if (title) {
	title.classList.toggle("expand");
    }
}
  
