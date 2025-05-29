
import { useState } from 'react';
import { CreateAppointment } from './CreateAppointment';
import { useNavigate } from 'react-router-dom';

export function CreateAppointmentPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleSuccess = () => {
    navigate('/');
  };

  return (
    <CreateAppointment onBack={handleBack} onSuccess={handleSuccess} />
  );
}
