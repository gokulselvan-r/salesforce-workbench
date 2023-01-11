import React from "react";
import { Card } from '@themesberg/react-bootstrap';



export const AboutMe = () => {
  return (
    <Card border="light" className="text-center p-0 mb-4">
      <div style={{ backgroundImage: `url(https://${window.location.host}/images/Learn%20With%20GandS.png)` }} className="profile-cover rounded-top" />
      <Card.Body className="pb-2">
        <Card.Img src={`https://${window.location.host}/images/GandS.png`} alt="Gokulselvan R" className="user-avatar large-avatar rounded-circle mx-auto mt-n7 mb-4" />
        <Card.Title>GandS</Card.Title>
        <Card.Subtitle className="fw-normal">Software Developer</Card.Subtitle>
        <Card.Text className="text-gray mb-4">Chennai, IN</Card.Text>

        
      </Card.Body>
    </Card>
  );
};
