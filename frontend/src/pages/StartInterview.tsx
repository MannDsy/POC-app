import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface StartInterviewPageProps {
  primaryThemeColor: string;
}

const SKILL_OPTIONS = [
  'Others',
  'C',
  'C++',
  'Embedded C',
  'Python',
  'Rust',
  'Java',
  'JavaScript',
  'TypeScript',
  'Go',

  // Embedded Systems & RTOS
  'Zephyr RTOS',
  'FreeRTOS',
  'RTOS',
  'Embedded Linux',
  'Linux',
  'Yocto',
  'Buildroot',
  'Bare Metal Programming',
  'Firmware Development',
  'Device Drivers',
  'Bootloader Development',
  'U-Boot',

  // Microcontrollers & SoCs
  'ARM Cortex-M',
  'ARM Cortex-A',
  'STM32',
  'ESP32',
  'AVR',
  'PIC',
  'MSP430',
  'Raspberry Pi',
  'BeagleBone',
  'NXP',
  'Nordic nRF',
  'TI Microcontrollers',

  // Hardware & Electronics
  'Embedded Systems',
  'Digital Electronics',
  'Analog Electronics',
  'PCB Design',
  'Circuit Design',
  'Hardware Debugging',
  'Oscilloscope',
  'Logic Analyzer',
  'JTAG',
  'UART',
  'SPI',
  'I2C',
  'CAN',
  'USB',
  'Ethernet',
  'GPIO',
  'PWM',
  'ADC/DAC',
  'FPGA',
  'Verilog',
  'VHDL',

  // IoT
  'Internet of Things (IoT)',
  'MQTT',
  'CoAP',
  'BLE',
  'Bluetooth',
  'Wi-Fi',
  'Zigbee',
  'LoRa',
  'NB-IoT',
  'Matter',

  // AI / Machine Learning
  'Artificial Intelligence',
  'Machine Learning',
  'Deep Learning',
  'Computer Vision',
  'Natural Language Processing',
  'Generative AI',
  'Large Language Models (LLMs)',
  'Prompt Engineering',
  'Retrieval-Augmented Generation (RAG)',
  'AI Agents',

  // Edge AI
  'Edge AI',
  'TinyML',
  'TensorFlow Lite',
  'TensorFlow Lite Micro',
  'ONNX Runtime',
  'OpenVINO',
  'NVIDIA Jetson',
  'Google Coral',
  'Qualcomm AI',
  'Model Optimization',

  // Data Science
  'Data Science',
  'Data Analytics',
  'Data Engineering',
  'Data Visualization',
  'Pandas',
  'NumPy',
  'Scikit-learn',
  'Matplotlib',
  'OpenCV',
  'PyTorch',
  'TensorFlow',
  'Keras',

  // Cloud & DevOps
  'AWS',
  'Azure',
  'Google Cloud Platform',
  'Docker',
  'Kubernetes',
  'Git',
  'GitHub',
  'GitLab',
  'Jenkins',
  'CI/CD',
  'Bash',
  'Shell Scripting',

  // Web Development
  'React',
  'Node.js',
  'Express.js',
  'Next.js',
  'HTML',
  'CSS',

  // Databases
  'SQL',
  'MySQL',
  'PostgreSQL',
  'SQLite',
  'MongoDB',
  'Redis',

  // Development Tools
  'CMake',
  'West',
  'GDB',
  'OpenOCD',
  'VS Code',
  'Visual Studio',
  'Eclipse',
  'Keil uVision',
  'IAR Embedded Workbench',
  'PlatformIO',

  // Testing & Quality
  'Unit Testing',
  'Integration Testing',
  'Hardware-in-the-Loop (HIL)',
  'Static Code Analysis',
];

export default function StartInterviewPage({
  primaryThemeColor,
}: StartInterviewPageProps) {
  const navigate = useNavigate();

  // If someone lands on this page without a valid session, send them to Login.
  useEffect(() => {
    const user = sessionStorage.getItem("loggedInUserEmail");
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const [candidateName, setCandidateName] = useState<string>('');
  const [candidateEmail, setCandidateEmail] = useState<string>('');
  const [candidatePhone, setCandidatePhone] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Primary Skill States
  const [primarySkill, setPrimarySkill] = useState<string>('');
  const [customPrimarySkill, setCustomPrimarySkill] = useState<string>('');
  const [primarySearch, setPrimarySearch] = useState<string>('');
  const [isPrimaryDropdownOpen, setIsPrimaryDropdownOpen] = useState<boolean>(false);

  // Secondary Skill States
  const [secondarySkill, setSecondarySkill] = useState<string>('');
  const [customSecondarySkill, setCustomSecondarySkill] = useState<string>('');
  const [secondarySearch, setSecondarySearch] = useState<string>('');
  const [isSecondaryDropdownOpen, setIsSecondaryDropdownOpen] = useState<boolean>(false);

  const handleCancel = () => {
    navigate('/home');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalPrimarySkill = primarySkill === 'Others' ? customPrimarySkill : primarySkill;
    const finalSecondarySkill = secondarySkill === 'Others' ? customSecondarySkill : secondarySkill;

    try {
      setSubmitting(true);

      const response = await api.post('/api/interviews', {
        candidateName,
        candidateEmail,
        candidatePhone: candidatePhone || undefined,
        primarySkill: finalPrimarySkill,
        secondarySkill: finalSecondarySkill || undefined,
      });

      if (response.data.success) {
        navigate('/home');
      }
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
        'Failed to start interview. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPrimarySkills = SKILL_OPTIONS.filter((skill) =>
    skill.toLowerCase().includes(primarySearch.toLowerCase())
  );

  const filteredSecondarySkills = SKILL_OPTIONS.filter((skill) =>
    skill.toLowerCase().includes(secondarySearch.toLowerCase())
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        height: '100vh',
        overflowY: 'auto',
        boxSizing: 'border-box',
        padding: '40px 20px 80px',
        background: '#f1f5f9',
      }}
    >
      <div
        style={{
          maxWidth: '640px',
          margin: '0 auto',
          background: '#ffffff',
          borderRadius: '16px',
          padding: '32px 32px 40px 32px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        }}
      >
      {/* Page Title */}
      <h2 style={{ margin: '0 0 20px 0', fontSize: '22px', fontWeight: 700, color: '#1e293b' }}>
        Interview Details
      </h2>

      {/* Subheading Divider */}
      <div
        style={{
          fontSize: '15px',
          fontWeight: 600,
          color: '#334155',
          paddingBottom: '8px',
          borderBottom: '1px solid #f1f5f9',
          marginBottom: '20px',
        }}
      >
        Candidate Information
      </div>

      {/* Scrollbar styling for the skill dropdowns */}
      <style>{`
        .dropdown-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .dropdown-scroll::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 4px;
        }
      `}</style>

      <form onSubmit={handleSubmit}>
        {/* Candidate Name Input */}
        <div style={{ marginBottom: '18px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: '#334155',
              marginBottom: '6px',
            }}
          >
            Candidate Name <span style={{ color: primaryThemeColor }}>*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Full name of the candidate"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '14px',
              color: '#0f172a',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Candidate Email Input */}
        <div style={{ marginBottom: '18px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: '#334155',
              marginBottom: '6px',
            }}
          >
            Candidate Email <span style={{ color: primaryThemeColor }}>*</span>
          </label>
          <input
            type="email"
            required
            placeholder="candidate@example.com"
            value={candidateEmail}
            onChange={(e) => setCandidateEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '14px',
              color: '#0f172a',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Candidate Phone Input (Optional) */}
        <div style={{ marginBottom: '18px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: '#334155',
              marginBottom: '6px',
            }}
          >
            Candidate Phone Number <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            type="tel"
            placeholder="+1 234 567 8900"
            value={candidatePhone}
            onChange={(e) => setCandidatePhone(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '14px',
              color: '#0f172a',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* PRIMARY SKILLS SEARCHABLE DROPDOWN */}
        <div style={{ marginBottom: '18px', position: 'relative' }}>
          <label
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: '#334155',
              marginBottom: '6px',
            }}
          >
            Primary Skill <span style={{ color: primaryThemeColor }}>*</span>
          </label>

          <div
            onClick={() => {
              setIsPrimaryDropdownOpen(!isPrimaryDropdownOpen);
              setIsSecondaryDropdownOpen(false);
            }}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '14px',
              color: primarySkill ? '#0f172a' : '#94a3b8',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxSizing: 'border-box',
            }}
          >
            <span>{primarySkill || 'Select primary skill'}</span>
            <span style={{ fontSize: '10px', color: '#64748b' }}>▼</span>
          </div>

          {isPrimaryDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                zIndex: 100,
                marginTop: '4px',
                padding: '8px',
              }}
            >
              <input
                type="text"
                placeholder="Search technology..."
                value={primarySearch}
                onChange={(e) => setPrimarySearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  marginBottom: '6px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <div className="dropdown-scroll" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                {filteredPrimarySkills.map((skill) => (
                  <div
                    key={skill}
                    onClick={() => {
                      setPrimarySkill(skill);
                      setIsPrimaryDropdownOpen(false);
                      setPrimarySearch('');
                    }}
                    style={{
                      padding: '8px 10px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      color: '#334155',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {skill}
                  </div>
                ))}
                {filteredPrimarySkills.length === 0 && (
                  <div style={{ padding: '8px', fontSize: '13px', color: '#94a3b8' }}>
                    No skills matched
                  </div>
                )}
              </div>
            </div>
          )}

          {primarySkill === 'Others' && (
            <input
              type="text"
              required
              placeholder="Enter custom primary skill"
              value={customPrimarySkill}
              onChange={(e) => setCustomPrimarySkill(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                color: '#0f172a',
                marginTop: '8px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          )}
        </div>

        {/* SECONDARY SKILLS SEARCHABLE DROPDOWN */}
        <div style={{ marginBottom: '28px', position: 'relative' }}>
          <label
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: '#334155',
              marginBottom: '6px',
            }}
          >
            Secondary Skill <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span>
          </label>

          <div
            onClick={() => {
              setIsSecondaryDropdownOpen(!isSecondaryDropdownOpen);
              setIsPrimaryDropdownOpen(false);
            }}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '14px',
              color: secondarySkill ? '#0f172a' : '#94a3b8',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxSizing: 'border-box',
            }}
          >
            <span>{secondarySkill || 'Select secondary skill'}</span>
            <span style={{ fontSize: '10px', color: '#64748b' }}>▼</span>
          </div>

          {isSecondaryDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                zIndex: 100,
                marginTop: '4px',
                padding: '8px',
              }}
            >
              <input
                type="text"
                placeholder="Search technology..."
                value={secondarySearch}
                onChange={(e) => setSecondarySearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  marginBottom: '6px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <div className="dropdown-scroll" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                {filteredSecondarySkills.map((skill) => (
                  <div
                    key={skill}
                    onClick={() => {
                      setSecondarySkill(skill);
                      setIsSecondaryDropdownOpen(false);
                      setSecondarySearch('');
                    }}
                    style={{
                      padding: '8px 10px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      color: '#334155',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {skill}
                  </div>
                ))}
                {filteredSecondarySkills.length === 0 && (
                  <div style={{ padding: '8px', fontSize: '13px', color: '#94a3b8' }}>
                    No skills matched
                  </div>
                )}
              </div>
            </div>
          )}

          {secondarySkill === 'Others' && (
            <input
              type="text"
              required
              placeholder="Enter custom secondary skill"
              value={customSecondarySkill}
              onChange={(e) => setCustomSecondarySkill(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                color: '#0f172a',
                marginTop: '8px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          )}
        </div>

        {/* Action Buttons: Cancel + Submit side by side */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={handleCancel}
            disabled={submitting}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: '15px',
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            style={{
              flex: 2,
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: primaryThemeColor,
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: `0 4px 12px ${primaryThemeColor}33`,
              transition: 'all 0.3s ease',
            }}
          >
            <span>{submitting ? 'Starting...' : 'Start Interview'}</span>
            {!submitting && <span>→</span>}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}