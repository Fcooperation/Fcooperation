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