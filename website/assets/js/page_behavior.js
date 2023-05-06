// Script to enable smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});


// Script to have the navbar follow the active section
const sections = document.querySelectorAll("section[id^=section]");
const rooms = document.querySelectorAll(".room");

const mainContainer = document.querySelector('main');

mainContainer.onscroll = function () { scrollHandler() };

function scrollHandler() {
    let scrollY = mainContainer.scrollTop;

    // Now we loop through sections to get height, top and ID values for each
    sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 100;
        let sectionId = current.getAttribute("id");


        /*
        - If our current scroll position enters the space where current section on screen is,
        add .active class to corresponding navigation link, else remove it
        - To know which link needs an active class, we use sectionId variable we are getting
        while looping through sections as an selector
        */
        if (
            scrollY > sectionTop &&
            scrollY <= sectionTop + sectionHeight
        ) {
            if (sectionId == "section_presentation") {
                document.querySelector("#startButton").classList.remove("hidden");
            } else {
                document.querySelector("#" + sectionId + "_room").classList.add("active");
            }
        } else {
            if (sectionId == "section_presentation") {
                document.querySelector("#startButton").classList.add("hidden");
            } else {
                document.querySelector("#" + sectionId + "_room").classList.remove("active");
            }
        }
    });
}

document.querySelector("#startButton").oncli
