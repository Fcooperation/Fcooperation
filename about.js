const menuBtn =
document.getElementById("menuBtn");

const menuDropdown =
document.getElementById("menuDropdown");

menuBtn.onclick = () => {

menuDropdown.classList.toggle("show");

};

document.addEventListener("click",(e)=>{

if(
!menuBtn.contains(e.target) &&
!menuDropdown.contains(e.target)
){

menuDropdown.classList.remove("show");

}

});

document
.querySelector(".footer-logo")
?.addEventListener("click", e=>{

e.preventDefault();

window.scrollTo({

top:0,

behavior:"smooth"

});

});