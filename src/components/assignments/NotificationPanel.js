import React, { useState } from 'react';
import { Alert, Button, Badge, Card, ListGroup } from 'react-bootstrap';
import { useAssignmentContext } from '../../contexts/AssignmentContext';

const NotificationPanel = () => {
  const { notifications, dismissNotification, dismissAllNotifications } = useAssignmentContext();
  const [collapsed, setCollapsed] = useState(false);

  const getNotificationIcon = (type) => {
    const icons = {
      'success': 'fas fa-check-circle text-success',
      'error': 'fas fa-exclamation-circle text-danger',
      'warning': 'fas fa-exclamation-triangle text-warning',
      'info': 'fas fa-info-circle text-info'
    };
    return icons[type] || 'fas fa-bell text-muted';
  };

  const getNotificationVariant = (type) => {
    const variants = {
      'success': 'success',
      'error': 'danger',
      'warning': 'warning',
      'info': 'info'
    };
    return variants[type] || 'secondary';
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - notifTime) / 1000);

    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)}h`;
    return notifTime.toLocaleDateString('fr-FR');
  };

  const groupedNotifications = notifications.reduce((groups, notification) => {
    const type = notification.type || 'info';
    if (!groups[type]) groups[type] = [];
    groups[type].push(notification);
    return groups;
  }, {});

  if (notifications.length === 0) {
    return (
      <Card>
        <Card.Body className="text-center py-4">
          <i className="fas fa-bell-slash fa-2x text-muted mb-2"></i>
          <div className="text-muted">Aucune notification</div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <div className="d-flex align-items-center justify-content-between">
          <h6 className="mb-0">
            <i className="fas fa-bell me-2"></i>
            Notifications
            <Badge bg="secondary" className="ms-2">
              {notifications.length}
            </Badge>
          </h6>
          
          <div className="d-flex gap-2">
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={() => setCollapsed(!collapsed)}
            >
              <i className={`fas fa-chevron-${collapsed ? 'down' : 'up'}`}></i>
            </Button>
            {notifications.length > 0 && (
              <Button
                size="sm"
                variant="outline-danger"
                onClick={dismissAllNotifications}
              >
                <i className="fas fa-times me-1"></i>
                Tout effacer
              </Button>
            )}
          </div>
        </div>

        {/* Compteurs par type */}
        {!collapsed && (
          <div className="mt-2">
            {Object.entries(groupedNotifications).map(([type, notifs]) => (
              <Badge 
                key={type} 
                bg={getNotificationVariant(type)} 
                className="me-2"
              >
                {type}: {notifs.length}
              </Badge>
            ))}
          </div>
        )}
      </Card.Header>

      {!collapsed && (
        <Card.Body className="p-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <ListGroup variant="flush">
            {notifications.slice().reverse().map((notification) => (
              <ListGroup.Item key={notification.id}>
                <div className="d-flex align-items-start">
                  <div className="me-3">
                    <i className={getNotificationIcon(notification.type)}></i>
                  </div>
                  
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center justify-content-between">
                      <h6 className="mb-1">{notification.title}</h6>
                      <div className="d-flex align-items-center">
                        <small className="text-muted me-2">
                          {formatTimestamp(notification.timestamp)}
                        </small>
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => dismissNotification(notification.id)}
                        >
                          <i className="fas fa-times"></i>
                        </Button>
                      </div>
                    </div>
                    
                    <p className="mb-1">{notification.message}</p>
                    
                    {notification.details && (
                      <div className="small text-muted">
                        {typeof notification.details === 'string' ? (
                          <span>{notification.details}</span>
                        ) : (
                          <ul className="mb-0">
                            {notification.details.map((detail, index) => (
                              <li key={index}>{detail}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {notification.actions && notification.actions.length > 0 && (
                      <div className="mt-2">
                        {notification.actions.map((action, index) => (
                          <Button
                            key={index}
                            size="sm"
                            variant={action.variant || 'outline-primary'}
                            className="me-2"
                            onClick={() => {
                              if (action.onClick) action.onClick();
                              if (action.dismissAfter) {
                                dismissNotification(notification.id);
                              }
                            }}
                          >
                            {action.icon && <i className={`${action.icon} me-1`}></i>}
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      )}

      <Card.Footer className="bg-light">
        <div className="d-flex justify-content-between align-items-center small">
          <span>
            {notifications.filter(n => n.type === 'error').length > 0 && (
              <span className="text-danger me-3">
                <i className="fas fa-exclamation-circle me-1"></i>
                {notifications.filter(n => n.type === 'error').length} erreur(s)
              </span>
            )}
            {notifications.filter(n => n.type === 'warning').length > 0 && (
              <span className="text-warning me-3">
                <i className="fas fa-exclamation-triangle me-1"></i>
                {notifications.filter(n => n.type === 'warning').length} avertissement(s)
              </span>
            )}
          </span>
          
          {notifications.length > 5 && (
            <span className="text-muted">
              {notifications.length} notification(s) au total
            </span>
          )}
        </div>
      </Card.Footer>
    </Card>
  );
};

export default NotificationPanel;
