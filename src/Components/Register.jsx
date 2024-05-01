import {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { collection, doc, getFirestore, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useState } from "react";

const GENDERS = ["Masculino", "Femenino", "Prefiero no decirlo"];

const Register = ({ storage }) => {
  const [photoUser, setPhotoUser] = useState(null);
  const [displayPhoto, setDisplayPhoto] = useState(null);
  const [loaderSuccessRegister, setLoaderSuccessRegister] = useState(false);
  const [nameUser, setNameUser] = useState("");
  const [genderUser, setGenderUser] = useState("Masculino");
  const [birthdayUser, setBirthdayUser] = useState("");
  const [emailUser, setEmailUser] = useState("");
  const [passUser, setPassUser] = useState("");
  const [smsInfo, setSmsInfo] = useState("");
  const [emptyPhotoUser, setEmptyPhotoUser] = useState(false);
  const AUTH = getAuth();
  const navigate = useNavigate();
  const db = getFirestore();
  const displaySmsInfo = (sms) => {
    setSmsInfo(sms);
    setTimeout(() => {
      setSmsInfo("");
    }, 3000);
  };

  const upMediaFile = async (e) => {
    const mediaFile = e.target.files[0];
    const maxSizefile = 5 * 1024 * 1024;
    if (!mediaFile.type.startsWith("image/")) {
      displaySmsInfo("Solo se permiten imagenes");
      return;
    }
    if (mediaFile.size > maxSizefile) {
      displaySmsInfo("El archivo excede el limite permitido");
      return;
    }
    const mediaUrl = URL.createObjectURL(mediaFile);
    setPhotoUser(mediaUrl);
    setDisplayPhoto(mediaFile);
    displaySmsInfo("Imagen subida correctamente :)");
  };
  const saveInfo = async () => {
    setLoaderSuccessRegister(true);
    try {
      if (!photoUser) {
        displaySmsInfo("¡ Sube una foto !");
        setEmptyPhotoUser(true);
        setTimeout(() => {
          setEmptyPhotoUser(false);
        }, 3000);
        setLoaderSuccessRegister(false);
        return;
      } else if (!nameUser) {
        displaySmsInfo("Ingresa tu nombre");
        setLoaderSuccessRegister(false);
        return;
      } else if (!isNaN(nameUser)) {
        displaySmsInfo("tú nombre no puede ser un número");
        setNameUser("");
        setLoaderSuccessRegister(false);
        return;
      } else if (!/^[a-zA-Z]+$/.test(nameUser)) {
        displaySmsInfo("solo caracteres alfabeticos ;)");
        setNameUser("");
        setLoaderSuccessRegister(false);
        return;
      } else if (!emailUser) {
        displaySmsInfo("ingresa el correo ;)");
        setLoaderSuccessRegister(false);
        return;
      } else if (!/\S+@\S+\.\S+/.test(emailUser)) {
        displaySmsInfo("El formato del correo electrónico no es válido");
        setEmailUser("");
        setLoaderSuccessRegister(false);
        return;
      } else if (!passUser) {
        displaySmsInfo("añade una contraseña (min-8 caracteres)");
        setLoaderSuccessRegister(false);
        return;
      } else if (passUser.length < 8) {
        displaySmsInfo("Tú contraseña debe tener mínimo 8 caracteres");
        setPassUser("");
        setLoaderSuccessRegister(false);
        return;
      }else if(!genderUser){
        displaySmsInfo("Seleccione su genero")
        setLoaderSuccessRegister(false);
        return;
      }else if(!birthdayUser){
        displaySmsInfo("Ingrese su año de nacimiento");
        setLoaderSuccessRegister(false);
        return;
      }else if((2024 - parseInt(birthdayUser.slice(0,4))) < 18) {
        displaySmsInfo("Eres menor de edad , intentalo nuevamente")
        setBirthdayUser("");
        setLoaderSuccessRegister(false);
        return;
      }
      const userCredential = await createUserWithEmailAndPassword(
        AUTH,
        emailUser,
        passUser
      );
      await updateProfile(userCredential.user, {
        displayName: nameUser,
      });
      const userId = userCredential.user.uid;
      const storageRef = ref(storage, `profileImages/${userId}/image.png`);
      await uploadBytes(storageRef, displayPhoto);
      const downloadUrl = await getDownloadURL(storageRef);
      const usersCollectionRef = collection(db, "USERS");
      await setDoc(doc(usersCollectionRef, userId), {
        name: nameUser,
        profileImage: downloadUrl,
        email: emailUser,
        role: "usuario",
        gender:genderUser ,
        birthdayUser,
      });
      displaySmsInfo("exito");
      setLoaderSuccessRegister(false);
      navigate("/Home");
    } catch (error) {
      console.log(error.message);
      setLoaderSuccessRegister(false);
      displaySmsInfo("Error , verifique sus credenciales");
    }
    setNameUser("");
    setPhotoUser(null);
    setEmailUser("");
    setPassUser("");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    saveInfo();
  };
  return (
    <>
      <section className="Cont-register">
        <h1>BIENVENIDOS 4A</h1>
        {photoUser ? (
          <div className="box-img-sz">
            <img
              width={100}
              height={110}
              src={photoUser}
              alt={`Usuario-${nameUser ? nameUser : null}`}
            />
          </div>
        ) : (
          <label
            style={{
              backgroundColor: `${
                !emptyPhotoUser ? "rgba(0, 0, 0, 0.95)" : "#D72323"
              }`,
              transition: "1.15s ease",
            }}
            className={`selectPhotoPerUp ${
              emptyPhotoUser ? "wobble-hor-bottom" : ""
            }`}
            htmlFor="inputPhotoUser"
          >
            +
            <input
              onChange={(e) => upMediaFile(e)}
              style={{ display: "none" }}
              type="file"
              accept="image/*"
              id="inputPhotoUser"
            />
          </label>
        )}
        {nameUser && <h4>Bienvenido {nameUser}...</h4>}
        <form>
          <label htmlFor="inputName">
            <input
              placeholder="ingresa tú nombre..."
              type="text"
              id="inputName"
              value={nameUser}
              onChange={(e) => setNameUser(e.target.value)}
            />
          </label>
          <label htmlFor="inputEmailUser">
            <input
              type="email"
              value={emailUser}
              onChange={(e) => setEmailUser(e.target.value)}
              placeholder="user@email.com"
              id="inputEmailUser"
            />
          </label>
          <label htmlFor="inputPassUser">
            <input
              type="password"
              value={passUser}
              onChange={(e) => setPassUser(e.target.value)}
              id="inputPassUser"
              placeholder="********"
            />
          </label>
          <select onChange={(e)=> setGenderUser(e.target.value)}>
              <option value="empty" disabled>
                {" "}
                seleccione su genero
              </option>
              {GENDERS.map((gender, index) => (
                <option value={gender} key={index} >{gender}</option>
              ))}
          </select>
          <label htmlFor="inputDate">
            <input type="date" value={birthdayUser} onChange={(e)=> setBirthdayUser(e.target.value)} id="inputDate" />
          </label>
          <button onClick={handleSubmit} type="button">
            Registrar
          </button>
        </form>
      </section>
      {smsInfo && (
        <div className="smsInfo slide-in-bottom">
          <h2>{smsInfo}</h2>
        </div>
      )}
      {loaderSuccessRegister && (
        <div className="LoadingModal ">
          <h2>¡ B I E N V E N I D O !</h2>
          <div className="loader"></div>
        </div>
      )}
    </>
  );
};

export default Register;
