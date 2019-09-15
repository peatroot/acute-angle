import React from 'react';
import { styled } from '@material-ui/styles';

const Screen = styled('div')(({ theme }) => ({
  padding: theme.spacing(1),
  minHeight: '100%',
  maxHeight: '100%',
}));

export default Screen;
