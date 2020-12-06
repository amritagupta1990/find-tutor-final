//helpers.js
export const getToken = () => {
    var authData = localStorage.getItem('auth-data');
    return authData;
}

export const getLoggedInUserDetails = () => {
    var userData = localStorage.getItem('user-details');
    return userData;
}

export const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };

export const validatePhoneNumber = (inputtxt) => {
    var phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return inputtxt.match(phoneno);
};

export const nameValidation = (inputtxt) => {
    var letters = /^[A-Za-z]+$/;
    return inputtxt.match(letters);
};

export const validateDigitsOnly = (inputtxt) => {
    var numbers =  /^-?\d+\.?\d*$/;
    return inputtxt.toString().match(numbers);
}

export const validateImageType = (img) => {
    var imgType = /\.(jpg|jpeg|png|gif)$/;
    return img.match(imgType);
}

export const validateImageSize = (imgSize) => {
    var validationStats = {};
    validationStats.check = true;
    if (Math.round(imgSize / (1024 * 1024)) > 2) { 
        const msg = "File too Big, please select a file less than 2mb";
        validationStats.msg = msg; 
        validationStats.check = false;
    } else{
        validationStats.check = true;
        validationStats.msg = "Successful";
    }
    return validationStats;
}

export const logout = (props) => {
    console.log('this', this);
    localStorage.removeItem('auth-data');
    localStorage.removeItem('user-details');
    props.history.push("/");
  }