"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import React from 'react';
import { Button, Card, CardBody, Link } from '@nextui-org/react';

const MapComponent = dynamic(() => import('../components/MapComponent'), {
  ssr: false
});

interface Report {
  _id: string;
  description: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  incidentType: string;
  address: string;
}

export default function Home() {

  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get('https://api-report-denuncias.agencsi.com/api/reports');
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };


  return (
    <Card className='relative'>
      <CardBody className='z-20 relative overflow-hidden'>
        <MapComponent reports={reports} />
      </CardBody>
      <Button 
      color="danger"
      href="/reportar"
      as={Link}
      showAnchorIcon
      className='absolute w-[300px] bottom-10 right-10 z-50'>
        Reportar Incidente
      </Button>

    </Card>

  );
}
