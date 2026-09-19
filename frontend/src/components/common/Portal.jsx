import { createPortal } from 'react-dom';

/**
 * Renders children directly onto document.body instead of in-place in the
 * React tree. This matters because a CSS animation/transition touching
 * `transform` on ANY ancestor makes that ancestor a "containing block" for
 * position:fixed descendants — which was silently breaking every modal that
 * happened to render inside an .anim-* animated card (the cause behind the
 * off-center / cut-off popups).
 */
const Portal = ({ children }) => createPortal(children, document.body);

export default Portal;
