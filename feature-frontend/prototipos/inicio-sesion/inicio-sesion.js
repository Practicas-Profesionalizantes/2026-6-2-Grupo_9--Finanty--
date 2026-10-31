(() => {
  "use strict";
  const form=document.getElementById("login-form"),email=document.getElementById("email"),password=document.getElementById("password");
  const emailError=document.getElementById("email-error"),passwordError=document.getElementById("password-error"),feedback=document.getElementById("form-feedback");
  const submit=document.getElementById("submit-button"),label=document.getElementById("submit-label"),spinner=document.getElementById("spinner"),toggle=document.getElementById("toggle-password");
  let tried=false,timer;
  function setError(input,box,message){box.textContent=message;box.hidden=!message;input.setAttribute("aria-invalid",String(Boolean(message)));input.closest(".input-wrap").classList.toggle("is-invalid",Boolean(message));}
  function emailMessage(){const value=email.value.trim();if(!value)return "Ingresá tu correo electrónico.";if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value))return "Revisá el formato del correo. Ejemplo: nombre@ejemplo.com.";return "";}
  function passwordMessage(){return password.value.trim()?"":"Ingresá tu contraseña.";}
  function clearFeedback(){window.clearTimeout(timer);feedback.hidden=true;feedback.textContent="";}
  function validate(){const em=emailMessage(),pw=passwordMessage();setError(email,emailError,em);setError(password,passwordError,pw);return{em,pw};}
  email.addEventListener("input",()=>{clearFeedback();if(tried)setError(email,emailError,emailMessage());});
  password.addEventListener("input",()=>{clearFeedback();if(tried)setError(password,passwordError,passwordMessage());});
  toggle.addEventListener("click",()=>{const reveal=password.type==="password";password.type=reveal?"text":"password";toggle.setAttribute("aria-pressed",String(reveal));toggle.setAttribute("aria-label",reveal?"Ocultar contraseña":"Mostrar contraseña");});
  form.addEventListener("submit",event=>{event.preventDefault();tried=true;clearFeedback();const result=validate();if(result.em||result.pw){(result.em?email:password).focus();return;}submit.disabled=true;submit.setAttribute("aria-busy","true");label.textContent="Validando…";spinner.hidden=false;timer=window.setTimeout(()=>{submit.disabled=false;submit.setAttribute("aria-busy","false");label.textContent="Iniciar sesión";spinner.hidden=true;feedback.textContent="Demostración del prototipo: los datos tienen formato válido. No se inició una sesión real.";feedback.hidden=false;},550);});
  document.getElementById("register-link").addEventListener("click",event=>{event.preventDefault();clearFeedback();feedback.textContent="El prototipo de registro se desarrollará por separado.";feedback.hidden=false;});
})();