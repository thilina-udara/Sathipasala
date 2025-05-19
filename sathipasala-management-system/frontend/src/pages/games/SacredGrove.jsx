import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaArrowLeft, FaVolumeUp, FaVolumeMute, FaQuestionCircle, FaMapMarkedAlt } from 'react-icons/fa';
import * as THREE from 'three';
import soundManager from '../../utils/soundUtils';

// Meditation spot data with bilingual content
const MEDITATION_SPOTS = [
  {
    id: 'bodhi',
    nameEn: 'Bodhi Tree',
    nameSi: 'බෝධි වෘක්ෂය',
    descriptionEn: 'A sacred fig tree where Buddha attained enlightenment.',
    descriptionSi: 'බුදුන් වහන්සේ බුද්ධත්වය ලැබූ පවිත්‍ර අඹ ගසකි.',
    position: { x: 10, y: 0, z: 10 },
    color: 0x7CFC00, // Light green
    teachings: {
      en: 'Sit quietly and focus on your breath. Feel the connection to all living beings around you.',
      si: 'නිහඬව වාඩි වී ඔබේ හුස්ම ගැන අවධානය යොමු කරන්න. ඔබ වටා සිටින සියලු ජීවීන් සමඟ ඇති සම්බන්ධතාවය දැනෙන්න.'
    }
  },
  {
    id: 'lotus',
    nameEn: 'Lotus Pond',
    nameSi: 'නෙළුම් පොකුණ',
    descriptionEn: 'A peaceful pond with beautiful lotus flowers.',
    descriptionSi: 'ලස්සන නෙළුම් මල් සහිත සාමකාමී පොකුණක්.',
    position: { x: -10, y: 0, z: -5 },
    color: 0xFFC0CB, // Pink
    teachings: {
      en: 'Like the lotus that grows from mud yet remains pure, we too can rise above difficulties.',
      si: 'මඩ වලින් හැදෙන නමුත් පිරිසිදුව පවතින නෙළුම් මල මෙන්, අපටත් අපහසුතා ජය ගත හැකිය.'
    }
  },
  {
    id: 'mountain',
    nameEn: 'Mountain View',
    nameSi: 'කඳු දර්ශනය',
    descriptionEn: 'A high vantage point overlooking valleys below.',
    descriptionSi: 'පහත මිටියාවත දෙස බලා සිටින ඉහළ ස්ථානයක්.',
    position: { x: 0, y: 5, z: -15 },
    color: 0xA9A9A9, // Dark gray
    teachings: {
      en: 'Like a mountain, be strong and unshaken by the winds of praise and blame.',
      si: 'කන්දක් මෙන්, ප්‍රශංසා හා චෝදනා නම් වූ සුළං වලින් නොසැලී ශක්තිමත්ව සිටින්න.'
    }
  },
  {
    id: 'stream',
    nameEn: 'Flowing Stream',
    nameSi: 'ගලන දිය පහර',
    descriptionEn: 'A gentle stream with clear water.',
    descriptionSi: 'පැහැදිලි ජලය සහිත මෘදු දිය පහරක්.',
    position: { x: 15, y: 0, z: -10 },
    color: 0x87CEFA, // Light sky blue
    teachings: {
      en: 'Like water, adapt to any situation while maintaining your true nature.',
      si: 'ජලය මෙන්, ඔබගේ සැබෑ ස්වභාවය පවත්වා ගනිමින් ඕනෑම තත්ත්වයකට හුරු වන්න.'
    }
  },
  {
    id: 'cave',
    nameEn: 'Meditation Cave',
    nameSi: 'භාවනා ගුහාව',
    descriptionEn: 'A quiet cave for deep meditation.',
    descriptionSi: 'ගැඹුරු භාවනාව සඳහා නිහඬ ගුහාවක්.',
    position: { x: -15, y: 0, z: 15 },
    color: 0x8B4513, // Saddle brown
    teachings: {
      en: 'In stillness and silence, the innermost truths are revealed.',
      si: 'නිශ්චලතාවය හා නිහඬතාවය තුළ, ඇතුළාන්තම සත්‍යයන් හෙළි වේ.'
    }
  }
];

const SacredGrove = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const language = i18n.language || 'en';
  
  const [soundEnabled, setSoundEnabled] = useState(!soundManager.muted);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [activeSpot, setActiveSpot] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Three.js references
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const spotRefs = useRef({});
  
  // Game initialization
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Load sounds
    soundManager.load('ambient', '/sounds/games/sacred-grove/ambient.mp3');
    soundManager.load('chime', '/sounds/games/sacred-grove/chime.mp3');
    soundManager.load('footsteps', '/sounds/games/sacred-grove/footsteps.mp3');
    
    // Play ambient sound if not muted
    if (!soundManager.muted) {
      soundManager.play('ambient');
    }
    
    // Initialize Three.js
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x87CEEB); // Sky blue
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75, 
      containerRef.current.clientWidth / containerRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.set(0, 5, 20);
    cameraRef.current = camera;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Create ground
    const textureLoader = new THREE.TextureLoader();
    
    // Track loading progress
    textureLoader.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      setLoadingProgress((itemsLoaded / itemsTotal) * 100);
    };
    
    // Ground plane
    textureLoader.load('/textures/grass.jpg', (texture) => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(20, 20);
      
      const groundGeometry = new THREE.PlaneGeometry(100, 100);
      const groundMaterial = new THREE.MeshStandardMaterial({ 
        map: texture, 
        side: THREE.DoubleSide 
      });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.1;
      ground.receiveShadow = true;
      scene.add(ground);
    });
    
    // Create skybox
    textureLoader.load('/textures/sky.jpg', (texture) => {
      const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
      const skyMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide
      });
      const sky = new THREE.Mesh(skyGeometry, skyMaterial);
      scene.add(sky);
    });
    
    // Create meditation spots
    MEDITATION_SPOTS.forEach((spot) => {
      // Create the base platform
      const platformGeometry = new THREE.CylinderGeometry(2, 2, 0.5, 32);
      const platformMaterial = new THREE.MeshStandardMaterial({ 
        color: spot.color,
        transparent: true,
        opacity: 0.8
      });
      const platform = new THREE.Mesh(platformGeometry, platformMaterial);
      platform.position.set(spot.position.x, spot.position.y, spot.position.z);
      platform.castShadow = true;
      platform.receiveShadow = true;
      platform.userData = { spotId: spot.id };
      
      // Create a symbol above the platform
      const symbolGeometry = new THREE.SphereGeometry(0.5, 16, 16);
      const symbolMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        emissive: spot.color,
        emissiveIntensity: 0.5
      });
      const symbol = new THREE.Mesh(symbolGeometry, symbolMaterial);
      symbol.position.set(
        spot.position.x, 
        spot.position.y + 2 + Math.sin(Date.now() * 0.001) * 0.2, 
        spot.position.z
      );
      symbol.castShadow = true;
      
      // Add decorative elements around the platform
      const spotGroup = new THREE.Group();
      spotGroup.add(platform);
      spotGroup.add(symbol);
      
      // Add trees or other elements based on spot type
      if (spot.id === 'bodhi') {
        // Add a simple tree
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 3, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(spot.position.x, spot.position.y + 1.5, spot.position.z);
        trunk.castShadow = true;
        
        const leavesGeometry = new THREE.SphereGeometry(2, 16, 16);
        const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.set(spot.position.x, spot.position.y + 4, spot.position.z);
        leaves.castShadow = true;
        
        spotGroup.add(trunk);
        spotGroup.add(leaves);
      }
      
      // Store spot reference for animations
      spotRefs.current[spot.id] = spotGroup;
      
      scene.add(spotGroup);
    });
    
    // Add some trees to the scene
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 80 - 40;
      const z = Math.random() * 80 - 40;
      
      // Skip if too close to a meditation spot
      if (MEDITATION_SPOTS.some(spot => 
        Math.sqrt(
          Math.pow(spot.position.x - x, 2) + 
          Math.pow(spot.position.z - z, 2)
        ) < 5
      )) {
        continue;
      }
      
      const height = Math.random() * 2 + 3;
      const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.4, height, 8);
      const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.set(x, height / 2, z);
      trunk.castShadow = true;
      
      const leavesGeometry = new THREE.ConeGeometry(height / 2, height, 8);
      const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
      const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
      leaves.position.set(x, height + height / 4, z);
      leaves.castShadow = true;
      
      scene.add(trunk);
      scene.add(leaves);
    }
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    let lastTime = 0;
    const animate = (time) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      
      // Animate meditation spots
      Object.entries(spotRefs.current).forEach(([id, spotGroup]) => {
        const symbol = spotGroup.children[1]; // Symbol is the second child
        symbol.position.y = spotGroup.children[0].position.y + 2 + Math.sin(time * 0.001) * 0.2;
        
        // Rotate the symbol
        symbol.rotation.y += dt * 0.5;
      });
      
      // Follow active spot with camera if one is selected
      if (activeSpot) {
        const spot = MEDITATION_SPOTS.find(s => s.id === activeSpot);
        if (spot) {
          // Smoothly move camera to look at the active spot
          const targetPosition = new THREE.Vector3(
            spot.position.x + 5,
            spot.position.y + 5,
            spot.position.z + 5
          );
          
          camera.position.lerp(targetPosition, dt);
          camera.lookAt(
            spot.position.x,
            spot.position.y + 1,
            spot.position.z
          );
        }
      }
      
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      soundManager.stop('ambient');
    };
  }, []);
  
  // Handle sound toggle
  const toggleSound = () => {
    const newState = soundManager.toggleMute();
    setSoundEnabled(!newState);
    
    if (!newState) {
      soundManager.play('ambient');
    } else {
      soundManager.stop('ambient');
    }
  };
  
  // Handle meditation spot click
  const handleSpotClick = (spotId) => {
    if (!soundManager.muted) {
      soundManager.play('chime');
    }
    
    setActiveSpot(spotId);
  };
  
  // Close active spot view
  const closeSpotView = () => {
    setActiveSpot(null);
    
    // Reset camera position
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 5, 20);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };
  
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-blue-50 dark:bg-gray-900">
      {/* Header */}
      <header className="w-full bg-white dark:bg-gray-800 shadow-md py-3 px-6 z-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            <FaArrowLeft className="mr-2" />
            <span>{language === 'si' ? 'මුල් පිටුවට' : 'Back to Home'}</span>
          </button>
          <h1 className="text-2xl font-bold text-center">
            {language === 'si' ? 'ශාන්ත වනය' : 'Sacred Grove'}
          </h1>
          <button
            onClick={toggleSound}
            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            aria-label={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? <FaVolumeUp size={24} /> : <FaVolumeMute size={24} />}
          </button>
        </div>
      </header>
      
      {/* 3D Container */}
      <div 
        ref={containerRef}
        className="flex-grow relative"
        style={{ cursor: 'pointer' }}
      >
        {/* Loading overlay */}
        {loadingProgress < 100 && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="text-2xl text-white mb-4">
                {language === 'si' ? 'පූරණය වෙමින්...' : 'Loading...'}
              </div>
              <div className="w-64 bg-gray-700 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              <div className="text-sm text-blue-300 mt-2">
                {Math.round(loadingProgress)}%
              </div>
            </div>
          </div>
        )}
        
        {/* Instructions Overlay */}
        {showInstructions && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-10">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-lg mx-4">
              <h2 className="text-2xl font-bold mb-4 text-center text-green-700 dark:text-green-400">
                {language === 'si' ? 'ශාන්ත වනයට සාදරයෙන් පිළිගනිමු!' : 'Welcome to the Sacred Grove!'}
              </h2>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {language === 'si' 
                  ? 'මෙය බුදුදහමේ කරුණු සහ භාවනාත්මක සිතුවිලි ඉගෙනීමට හා අත්විඳීමට හැකි ත්‍රිමාන භාවනා වනයකි.'
                  : 'This is a 3D meditation grove where you can learn and experience the teachings of Buddhism and mindful thoughts.'}
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-4">
                <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2">
                  {language === 'si' ? 'ක්‍රීඩා කරන ආකාරය:' : 'How to Explore:'}
                </h3>
                <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1">
                  <li>
                    {language === 'si'
                      ? 'එක් එක් භාවනා ස්ථාන වෙත යන්න'
                      : 'Visit each meditation spot'}
                  </li>
                  <li>
                    {language === 'si'
                      ? 'එක් එක් ස්ථානයේ ඉගෙනුම් ලබා ගන්න'
                      : 'Learn the teachings at each location'}
                  </li>
                  <li>
                    {language === 'si'
                      ? 'භාවනාත්මක අත්දැකීම් සඳහා සාමකාමී පරිසරය භාවිතා කරන්න'
                      : 'Use the peaceful environment for mindful experiences'}
                  </li>
                </ul>
              </div>
              
              <div className="text-center">
                <button
                  onClick={() => setShowInstructions(false)}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg transition shadow"
                >
                  {language === 'si' ? 'ආරම්භ කරන්න' : 'Begin Journey'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* UI Controls */}
        <div className="absolute bottom-4 right-4 space-y-2">
          <button
            onClick={() => setShowMap(!showMap)}
            className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:bg-blue-100 dark:hover:bg-gray-700 transition"
            title={language === 'si' ? 'සිතියම' : 'Map'}
          >
            <FaMapMarkedAlt size={24} className="text-blue-600 dark:text-blue-400" />
          </button>
          
          <button
            onClick={() => setShowInstructions(true)}
            className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:bg-blue-100 dark:hover:bg-gray-700 transition"
            title={language === 'si' ? 'උපදෙස්' : 'Instructions'}
          >
            <FaQuestionCircle size={24} className="text-blue-600 dark:text-blue-400" />
          </button>
        </div>
        
        {/* Map Overlay */}
        {showMap && (
          <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-10 w-64">
            <h3 className="text-lg font-bold mb-2">
              {language === 'si' ? 'භාවනා ස්ථාන' : 'Meditation Spots'}
            </h3>
            <div className="space-y-2">
              {MEDITATION_SPOTS.map(spot => (
                <button
                  key={spot.id}
                  className="w-full text-left p-2 rounded hover:bg-blue-100 dark:hover:bg-gray-700 transition flex items-center"
                  onClick={() => handleSpotClick(spot.id)}
                >
                  <div 
                    className="w-4 h-4 rounded-full mr-2" 
                    style={{ backgroundColor: `#${spot.color.toString(16)}` }}
                  ></div>
                  <span>
                    {language === 'si' ? spot.nameSi : spot.nameEn}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Active Spot Information */}
        {activeSpot && (
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 rounded-t-lg shadow-lg z-10 max-w-2xl mx-auto">
            <button 
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={closeSpotView}
            >
              ✕
            </button>
            
            {MEDITATION_SPOTS.filter(spot => spot.id === activeSpot).map(spot => (
              <div key={spot.id} className="pb-10">
                <h3 className="text-xl font-bold text-center mb-2">
                  {language === 'si' ? spot.nameSi : spot.nameEn}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-center">
                  {language === 'si' ? spot.descriptionSi : spot.descriptionEn}
                </p>
                
                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                    {language === 'si' ? 'බෞද්ධ උගැන්වීම:' : 'Buddhist Teaching:'}
                  </h4>
                  <p className="italic text-gray-700 dark:text-gray-300">
                    {language === 'si' ? spot.teachings.si : spot.teachings.en}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SacredGrove;
