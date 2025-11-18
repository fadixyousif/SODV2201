// Notification Component
import { Toast, ToastContainer } from 'react-bootstrap';
import '../css/Notification.css';

// Notification component to display messages
function Notification({ show, onClose, type = 'info', title = '', message = '' }) {
	// render the notification
	return (
		/*
			Notification Component
			Displays a notification with specified type, title, and message
			Auto-hides after a delay
		*/
		<ToastContainer position="top-end" className="p-3 notification-toast-container" style={{ zIndex: 9999 }}>
			<Toast
				bg={type}
				show={show}
				onClose={onClose}
				delay={3000}
				autohide
				className="notification-toast shadow-lg rounded-4"
			>
				{title && (
					<Toast.Header className="notification-toast-header rounded-top-4">
						<strong className="me-auto">{title}</strong>
					</Toast.Header>
				)}
				<Toast.Body
					className={
						'notification-toast-body ' +
						(type === 'warning' || type === 'info' ? 'text-dark' : 'text-white')
					}
				>
					{message}
				</Toast.Body>
			</Toast>
		</ToastContainer>
	);
}

export default Notification;
