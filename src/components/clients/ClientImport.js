import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Table } from 'react-bootstrap';
import { FaFileImport, FaDownload, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { clientService } from '../../services/api';
import { toast } from 'react-toastify';

const ClientImport = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== 'text/csv') {
      toast.error('Veuillez sélectionner un fichier CSV');
      return;
    }
    setSelectedFile(file);
    setImportResult(null);
  };

  const handleImport = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('Veuillez sélectionner un fichier CSV');
      return;
    }

    try {
      setImporting(true);
      
      const formData = new FormData();
      formData.append('csvFile', selectedFile);
      
      const response = await clientService.importFromCSV(formData);
      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message);
        setImportResult(result);
      } else {
        toast.error(result.message);
        setImportResult(result);
      }
    } catch (error) {
      console.error('Erreur import:', error);
      toast.error('Erreur lors de l\'importation');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `prenom,nom,telephone,type,taille_groupe,notes
Jean,Dupont,+33123456789,Solo,1,Client VIP
Marie,Martin,+33987654321,Groupe,4,Famille avec enfants
Pierre,Bernard,+33456789123,Solo,1,
Sophie,Durand,+33789123456,Groupe,2,Couple`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_clients.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card>
            <Card.Header className="bg-success text-white">
              <h4 className="mb-0">
                <FaFileImport className="me-2" />
                Importer des Clients depuis un CSV
              </h4>
            </Card.Header>
            <Card.Body>
              {/* Instructions */}
              <Alert variant="info">
                <h6>Instructions d'importation :</h6>
                <ul className="mb-0">
                  <li>Le fichier doit être au format CSV</li>
                  <li>Les colonnes requises sont : <strong>prenom, nom, telephone</strong></li>
                  <li>Les colonnes optionnelles : <strong>type, taille_groupe, notes</strong></li>
                  <li>Le type peut être "Solo" ou "Groupe" (défaut: Solo)</li>
                  <li>La taille du groupe doit être un nombre entre 1 et 20</li>
                </ul>
              </Alert>

              {/* Télécharger le template */}
              <div className="mb-4">
                <Button variant="outline-primary" onClick={downloadTemplate}>
                  <FaDownload className="me-1" />
                  Télécharger le Template CSV
                </Button>
              </div>

              {/* Format attendu */}
              <Card className="mb-4">
                <Card.Header>
                  <h6 className="mb-0">Format attendu du CSV :</h6>
                </Card.Header>
                <Card.Body>
                  <Table size="sm" className="mb-0">
                    <thead>
                      <tr>
                        <th>prenom</th>
                        <th>nom</th>
                        <th>telephone</th>
                        <th>type</th>
                        <th>taille_groupe</th>
                        <th>notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Jean</td>
                        <td>Dupont</td>
                        <td>+33123456789</td>
                        <td>Solo</td>
                        <td>1</td>
                        <td>Client VIP</td>
                      </tr>
                      <tr>
                        <td>Marie</td>
                        <td>Martin</td>
                        <td>+33987654321</td>
                        <td>Groupe</td>
                        <td>4</td>
                        <td>Famille</td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>

              {/* Formulaire d'upload */}
              <Form onSubmit={handleImport}>
                <Form.Group className="mb-3">
                  <Form.Label>Sélectionner le fichier CSV</Form.Label>
                  <Form.Control
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    disabled={importing}
                  />
                </Form.Group>

                <div className="d-flex justify-content-between">
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/clients')}
                    disabled={importing}
                  >
                    <FaArrowLeft className="me-1" />
                    Retour
                  </Button>
                  <Button
                    type="submit"
                    variant="success"
                    disabled={!selectedFile || importing}
                  >
                    {importing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Importation...
                      </>
                    ) : (
                      <>
                        <FaFileImport className="me-1" />
                        Importer
                      </>
                    )}
                  </Button>
                </div>
              </Form>

              {/* Résultat de l'importation */}
              {importResult && (
                <Alert variant={importResult.success ? 'success' : 'warning'} className="mt-4">
                  <h6>Résultat de l'importation :</h6>
                  <p><strong>Message :</strong> {importResult.message}</p>
                  {importResult.imported && (
                    <p><strong>Clients importés :</strong> {importResult.imported}</p>
                  )}
                  {importResult.errors && importResult.errors.length > 0 && (
                    <div>
                      <strong>Erreurs :</strong>
                      <ul className="mb-0 mt-2">
                        {importResult.errors.slice(0, 10).map((error, index) => (
                          <li key={index} className="small">{error}</li>
                        ))}
                        {importResult.errors.length > 10 && (
                          <li className="small text-muted">
                            ... et {importResult.errors.length - 10} autres erreurs
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                  {importResult.success && (
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => navigate('/clients')}
                    >
                      Voir les clients importés
                    </Button>
                  )}
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ClientImport;