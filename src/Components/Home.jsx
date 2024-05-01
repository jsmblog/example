import { collection, getFirestore, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import sesionOff from "../image/cerrar-sesion-white.png";
import { signOut } from "firebase/auth";
import {useNavigate} from 'react-router-dom'
const Home = ({ userAuth , user }) => {
  const [dataUsers, setDataUsers] = useState([]);
  const [isOnDisplayPhotoUser, setIsOnDisplayPhotoUser] = useState(false);
  const [displayPhotoUser, setDisplayPhotoUser] = useState(null);
  const [loaderSesionOff, setLoaderSesionOff] = useState(false);
  const navigate = useNavigate();
  const db = getFirestore();
  useEffect(() => {
    const getAllDocs = async () => {
      try {
        if(!user){
          navigate("/");
        }
        const collect = collection(db, "USERS");
        const obtainData = onSnapshot(collect, (snapshot) => {
          const data = [];
          snapshot.forEach((doc) => {
            const userData = doc.data();
            data.push({
              uid: doc.id,
              ...userData,
            });
            setDataUsers(data);
          });
        });
        return () => obtainData();
      } catch (error) {
        console.log(error.message);
      }
    };
    getAllDocs();
  }, [user]);

  const handleSignOut = async () => {
    setLoaderSesionOff(true);
    try {
      await signOut(userAuth);
      setTimeout(() => {
        navigate("/");
        setLoaderSesionOff(false);
      }, 3000);
    } catch (error) {
      console.error("Error al cerrar sesión: ");
      setLoaderSesionOff(false);
    }
  };

  return (
    <>
      <main className="cont-main-home">
        {dataUsers && dataUsers !== null ? (
          <>
            <div className="descpt-user">
              <h2>Usuario</h2> <h2>Rol</h2> <h2>Correo</h2>{" "}
              <img
              onClick={handleSignOut}
                style={{ cursor: "pointer" }}
                width={30}
                src={sesionOff}
                alt=""
              />
            </div>
            {dataUsers.map((user, index) => (
              <section key={index}>
                <div
                  onClick={() => {
                    setIsOnDisplayPhotoUser(true);
                    setDisplayPhotoUser(user.profileImage);
                  }}
                  className="photo-and-name"
                >
                  <img
                    src={user.profileImage}
                    width={50}
                    height={50}
                    alt={`usuario-${user.name}`}
                  />
                  <h1>{user.name.length >= 6 ? `${user.name.slice(0,6)}...` : user.name}</h1>
                </div>
                <span>{user.role}</span>
                <h3>{user.email.length >= 15 ? `${user.email.slice(0,14)}...` : user.email}</h3>
              </section>
            ))}
          </>
        ) : (
          <div>
            <h2>No hay usuarios...</h2>
          </div>
        )}
      </main>
      {isOnDisplayPhotoUser && displayPhotoUser !== null && (
        <div className="display-Photo-User bounce-in-top">
          <img width={300} height={350} src={displayPhotoUser} alt="" />
          <button onClick={() => setIsOnDisplayPhotoUser(false)}>X</button>
        </div>
      )}
      {loaderSesionOff && (
        <div className="LoadingModal ">
          <h2>Cerrando sesión...</h2>
          <div className="loader"></div>
        </div>
      )}
    </>
  );
};

export default Home;
