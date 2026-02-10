import { useRef, useState, useEffect } from "react";
import { Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";

const TakePhoto = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [photoData, setPhotoData] = useState<string | null>(null);

  const [location, setLocation] = useState({ latitude: "", longitude: "" });

  useEffect(() => {
    startCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (error) {
      console.error("Gagal mengakses kamera:", error);
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const geoOptions = {
    enableHighAccuracy: true, 
    timeout: 10000,           
    maximumAge: 0            
  };
    
    navigator.geolocation.getCurrentPosition(
    (position) => {
      setLocation({
        latitude: position.coords.latitude.toString(),
        longitude: position.coords.longitude.toString(),
      });
    },
    (err) => console.error("Gagal ambil lokasi", err),
    geoOptions
  );

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const dataUrl = canvas.toDataURL("image/png");
      setPhotoData(dataUrl);
      setPhotoTaken(true);
    }
  };

  const handleNavigate = () => {
    navigate("/Verification", {
      state: {
        photo: photoData,
        latitude: location.latitude,
        longitude: location.longitude,
      },
    });
  };

  return (
    <div className="flex flex-col items-center text-[#122C93] p-10 justify-between min-h-screen bg-[#F5F7FF]">
      <div className="header-content flex flex-col gap-2 items-center">
        <h2 className="text-[20px] font-semibold">Forum Absensi Wajah</h2>
        <h2 className="text-[15px] font-medium">Scan Wajah Anda</h2>
      </div>

      <div className="area-photo-container flex flex-col items-center gap-4 relative">
        <div className="area-photo relative w-[300px] h-[300px] bg-white rounded-xl border-2 border-dashed border-[#122C93] flex items-center justify-center overflow-hidden">
          {!photoTaken ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              
              style={{ transform: "scaleX(-1)" }} 
              className="object-cover w-full h-full rounded-xl"
            />
          ) : (
            <img
              src={photoData ?? ""}
              alt="Hasil Foto"
              className="object-cover w-full h-full rounded-xl"
            />
          )}
          <canvas ref={canvasRef} className="hidden"></canvas>
          {!photoTaken && (
            <div className="absolute w-[180px] h-[230px] rounded-full border-2 border-dashed border-black"></div>
          )}
        </div>
        {photoTaken && (
          <p className="text-xs text-gray-500 flex flex-col items-center gap-5">
            Lokasi Tercatat: {location.latitude}, {location.longitude}
            <span className="text-[#122C93] font-semibold">
              Pastikan Lokasi Sudah Didapatkan
            </span>
          </p>
        )}
      </div>

      <div className="flex flex-col items-center mt-6">
        {!photoTaken ? (
          <Button
            color="primary"
            className="bg-[#122C93] w-[350px] h-11 font-semibold"
            onPress={takePhoto}
          >
            Ambil Foto
          </Button>
        ) : (
          <Button
            color="primary"
            className="bg-[#122C93] w-[350px] h-11 font-semibold"
            onPress={handleNavigate}
          >
            Unggah Foto
          </Button>
        )}
      </div>
    </div>
  );
};

export default TakePhoto;