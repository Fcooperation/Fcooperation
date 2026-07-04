const menuBtn =
document.getElementById("menuBtn");

const dropdown =
document.getElementById("menuDropdown");

menuBtn.onclick = ()=>{

dropdown.classList.toggle("show");

};

document.onclick = e=>{

if(
!menuBtn.contains(e.target)
&&
!dropdown.contains(e.target)
){

dropdown.classList.remove("show");

}

};

document
.querySelector(".footer-logo")
?.addEventListener("click", e=>{

e.preventDefault();

window.scrollTo({

top:0,

behavior:"smooth"

});

});