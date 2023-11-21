/**
 * this function kicks of the form setup and which further calls
 * other functions to validate and verify. Also, handles buttons
 * @param {Event} e
 */
function setupFrom(e) {
  const form = document.querySelector("#businessForm")
  const formPrevButtons = form.querySelectorAll(".prev")
  const formNextButtons = form.querySelectorAll(".next")
  const formData = JSON.parse(localStorage.getItem("formdata"))

  fetchData().then((data) => {
    makeRadioGroup(form, "pos", data.pos)
    makeRadioGroup(form, "channel", data.channel)

    if (formData !== null) {
      fillUpFormData(form, formData)
    }
  })
  setupCustomDropdown()

  let step = 1

  formPrevButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      step -= 1
      setupSteps(form, step)
    })
  })

  formNextButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const verify = verifyStep(form, step)
      if (!verify.valid) {
        verify.inputid.forEach((id) => {
          let input =
            document.getElementById(id) ||
            document.querySelector(`[name="${id}"]`)
          if (input.type !== "radio") {
            input.classList.add("error")
          } else {
            input
              .closest(".custom-dropdown-container")
              .querySelector(".custom-dropdown-head")
              .classList.add("error")
          }
        })
        updateFormLocalstorage(form, step)
        return
      } else {
        updateFormLocalstorage(form, step)
        const stepDiv = form.querySelector(`.step[data-step="${step}"]`)
        stepDiv.querySelectorAll(".error").forEach((elem) => {
          elem.classList.remove("error")
        })
      }
      step += 1
      setupSteps(form, step)
    })
  })

  setupSteps(form, step)

  form.addEventListener("submit", (e) => {
    e.preventDefault()
    let payload = JSON.parse(localStorage.getItem("formdata"))

    fetch("http://localhost:5000/account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        console.log("response", response)
        if (!response.ok) {
          console.log("Error :", response.status, response.statusText)
        } else {
          form.style.display = "none"
          document.querySelector(".progress-bar").style.display = "none"
          document.querySelector(".submission-container").style.display = "grid"
          localStorage.removeItem("formdata")
        }
      })
      .catch((error) => {
        console.error("Error:", error)
      })
  })
}

/**
 * This function sets up the steps process in both the form
 * and the progress bar.
 * @param {HTMLFormElement} form
 * @param {number} step
 */
function setupSteps(form, step) {
  const formSteps = form.querySelectorAll(".step")
  const formProgressSteps = document.querySelectorAll(
    ".progress-bar .progress-steps"
  )

  formSteps.forEach((element) => {
    if (parseInt(element.dataset.step) === step) {
      element.classList.add("active")
    } else {
      element.classList.remove("active")
    }
  })

  formProgressSteps.forEach((element) => {
    if (parseInt(element.dataset.step) <= step) {
      element.classList.add("active")
    } else {
      element.classList.remove("active")
    }
  })

  if (step === 3) {
    const verifyContainer = document.querySelectorAll(
      "form .verify-container div"
    )
    const formData = JSON.parse(localStorage.getItem("formdata"))
    verifyContainer.forEach((elem) => {
      elem.querySelector("span").textContent = formData[elem.dataset.form]
    })
  }
}

/**
 * This function checks whether the required inputs in a particular
 * step are verified. Returns a json object with valid status and
 * array of ids of inputs that don't validate
 * @param {HTMLFormElement} form
 * @param {number} step
 * @returns {JSON} inputValidity
 */
function verifyStep(form, step) {
  const stepDiv = form.querySelector(`.step[data-step="${step}"]`)
  const required = stepDiv.querySelectorAll("[required]")

  const inputValidity = {
    valid: true,
    inputid: [],
  }

  required.forEach((input) => {
    if (!input.checkValidity()) {
      inputValidity.valid = false
      if (input.type === "radio") {
        inputValidity.inputid.push(input.name)
      } else {
        inputValidity.inputid.push(input.id)
      }
    }
  })

  return inputValidity
}

/**
 * This function fills up the form with provided from data.
 * @param {HTMLFormElement} form
 * @param {JSON} formData
 */
function fillUpFormData(form, formData) {
  for (id in formData) {
    let inputElement =
      form.querySelector(`[id="${id}"]`) || form.querySelector(`[name="${id}"]`)
    if (inputElement.tagName === "INPUT" && inputElement.type !== "radio") {
      form.querySelector(`input[id="${id}"]`).value = formData[id]
    } else if (
      inputElement.tagName === "INPUT" &&
      inputElement.type === "radio"
    ) {
      const radioButtons = form.querySelectorAll(`input[name="${id}"]`)
      const customDropdownContainers = document.querySelectorAll(
        ".custom-dropdown-container"
      )
      customDropdownContainers.forEach((container) => {
        const containerSelection = container.querySelector(
          "button.custom-dropdown"
        )
        const radioGroup = container.querySelectorAll("input[type=radio]")
        containerSelection.textContent = formData[container.dataset.dropdown]
        radioGroup.forEach((radio) => {
          if (radio.value === formData[id]) {
            radio.setAttribute("checked", "true")
          }
        })
      })
    } else if (inputElement.tagName === "SELECT") {
      Array.from(inputElement.options).forEach((opt) => {
        if (opt.value === formData[id]) {
          opt.selected = true
        }
      })
    }
  }
}

/**
 * This updates the localstorage with the inputs ids and names
 * @param {HTMLFormElement} form
 * @param {number} step
 */
function updateFormLocalstorage(form, step) {
  const stepDiv = form.querySelector(`.step[data-step="${step}"]`)
  const inputData = {}

  stepDiv.querySelectorAll("input, select").forEach((input) => {
    if (input.type === "radio" && input.checked) {
      inputData[input.name] = input.value
    } else if (input.type !== "radio") {
      inputData[input.name] = input.value
    }
  })
  const storedInputs = JSON.parse(localStorage.getItem("formdata")) || {}
  const objInputs = { ...storedInputs, ...inputData }
  localStorage.setItem("formdata", JSON.stringify(objInputs))
}

/**
 * this function makes a list of drop down radio buttons in
 * a form. it requires particular template to work.
 * @param {HTMLFormElement} form
 * @param {string} radioname
 * @param {JSON} data
 */
function makeRadioGroup(form, radioname, data) {
  const dropDownContainer = form.querySelector(
    `.custom-dropdown-container[data-dropdown="${radioname}"]`
  )

  let radioContent = dropDownContainer.querySelector(
    ".custom-dropdown-content .radio-buttons"
  )

  const radioButtons = []

  data.map((obj) => {
    const safeName = obj.name.replaceAll(" ", "").toLowerCase()
    const radioBtn = document.createElement("div")
    radioBtn.classList.add("radio-btn")
    const label = document.createElement("label")
    label.setAttribute("for", safeName)
    const labelImage = document.createElement("img")
    labelImage.setAttribute("src", obj.imageUrl)
    labelImage.setAttribute("alt", obj.name)
    label.appendChild(labelImage)
    const radioInput = document.createElement("input")
    radioInput.setAttribute("type", "radio")
    radioInput.setAttribute("name", radioname)
    radioInput.setAttribute("id", safeName)
    radioInput.setAttribute("value", obj.name)
    radioInput.setAttribute("required", "true")

    radioBtn.appendChild(radioInput)
    radioBtn.appendChild(label)
    radioButtons.push(radioBtn)
  })

  for (let i = 0; i < radioButtons.length; i++) {
    radioContent.appendChild(radioButtons[i])
  }
}

/**
 * sets up the custom drop inside the class custom-dropdown-container
 */
function setupCustomDropdown() {
  const customDropdown = document.querySelectorAll(".custom-dropdown-container")

  customDropdown.forEach((container) => {
    const customDropdownHead = container.querySelector(".custom-dropdown-head")
    const customDropdownContent = container.querySelector(
      ".custom-dropdown-content"
    )

    customDropdownHead.addEventListener("click", (e) => {
      customDropdownHead.classList.toggle("active")
      customDropdownContent.classList.toggle("active")
    })

    customDropdownContent.addEventListener("click", (e) => {
      if (e.target.tagName === "INPUT" && e.target.type === "radio") {
        customDropdownHead.querySelector("button").textContent = e.target.value
      }
    })
  })
}

/**
 * This function returns a object of pos and channel
 * @returns object of pos and channel
 */
async function fetchData() {
  try {
    const [response1, response2] = await Promise.all([
      fetch("http://localhost:5000/pos"),
      fetch("http://localhost:5000/channel"),
    ])

    if (!response1.ok || !response2.ok) {
      throw new Error("Network response was not ok", response1, response2)
    }

    const pos = await response1.json()
    const channel = await response2.json()

    return { pos, channel }
  } catch (error) {
    console.error(
      "There has been a problem with your fetch operation: ",
      error.message
    )
  }
}

window.addEventListener("DOMContentLoaded", (e) => {
  setupFrom(e)
})
