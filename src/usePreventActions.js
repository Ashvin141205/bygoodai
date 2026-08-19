import { useEffect } from 'react';

const usePreventActions = () => {
    useEffect(() => {
        // Disable right-click
        const handleContextMenu = (e) => e.preventDefault();
        document.addEventListener('contextmenu', handleContextMenu);

        // Disable text selection
        const handleSelectStart = (e) => e.preventDefault();
        document.addEventListener('selectstart', handleSelectStart);

        // Disable text copying
        const handleCopy = (e) => e.preventDefault();
        document.addEventListener('copy', handleCopy);

        // Cleanup event listeners on component unmount
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('selectstart', handleSelectStart);
            document.removeEventListener('copy', handleCopy);
        };
    }, []);
};

export default usePreventActions;
