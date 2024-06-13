import PropTypes from 'prop-types';
import { useMutation } from '@apollo/client';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { useQueryClient } from '@tanstack/react-query';

import useEnqueueSnackbar from 'hooks/useEnqueueSnackbar';
import * as React from 'react';
import ConfirmationDialog from 'components/ConfirmationDialog';
import { DELETE_USER } from 'graphql/mutations/delete-user.ee';
import useFormatMessage from 'hooks/useFormatMessage';

function DeleteUserButton(props) {
  const { userId } = props;
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [deleteUser] = useMutation(DELETE_USER, {
    variables: { input: { id: userId } },
    refetchQueries: ['GetUsers'],
  });
  const formatMessage = useFormatMessage();
  const enqueueSnackbar = useEnqueueSnackbar();
  const queryClient = useQueryClient();

  const handleConfirm = React.useCallback(async () => {
    try {
      await deleteUser();
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setShowConfirmation(false);
      enqueueSnackbar(formatMessage('deleteUserButton.successfullyDeleted'), {
        variant: 'success',
        SnackbarProps: {
          'data-test': 'snackbar-delete-user-success',
        },
      });
    } catch (error) {
      throw new Error('Failed while deleting!');
    }
  }, [deleteUser]);

  return (
    <>
      <IconButton
        data-test="delete-button"
        onClick={() => setShowConfirmation(true)}
        size="small"
      >
        <DeleteIcon />
      </IconButton>

      <ConfirmationDialog
        open={showConfirmation}
        title={formatMessage('deleteUserButton.title')}
        description={formatMessage('deleteUserButton.description')}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirm}
        cancelButtonChildren={formatMessage('deleteUserButton.cancel')}
        confirmButtonChildren={formatMessage('deleteUserButton.confirm')}
        data-test="delete-user-modal"
      />
    </>
  );
}

DeleteUserButton.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default DeleteUserButton;
