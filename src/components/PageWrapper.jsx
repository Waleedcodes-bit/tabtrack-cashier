import React from 'react';

const PageWrapper = ({ children }) => (
  <div className="page-transition min-h-screen">
    {children}
  </div>
);

export default PageWrapper;