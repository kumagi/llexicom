function meaning_clicked(m) {
    const content = m.parentElement;
    const body = content.querySelector('.meaning-content');
    if (body) {
	body.classList.toggle("visible");
    }
    const title = content.querySelector('.meaning-title');
    if (title) {
	title.classList.toggle("expand");
    }
}
  
