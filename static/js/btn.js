const fileBtn = document.getElementById("fileUpload");
  const cstBtn = document.getElementById("cstBtn");
  const cstTxt = document.getElementById("cstTxt");
  
  cstBtn.addEventListener("click", function(){
    fileBtn.click();
  });
  
  fileBtn.addEventListener("change", function(){
    if(fileBtn.value){
      cstTxt.innerHTML = fileBtn.value.match(/[\/\\]([\w\d\s\.\-\(\)]+)$/)[1];
    } else{
      cstTxt.innerHTML = 'No upload recieved, yet.';
    }
  });