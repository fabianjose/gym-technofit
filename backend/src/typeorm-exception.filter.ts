import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Response } from 'express';

@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno en la base de datos.';

    // Error 1062 de MySQL: Duplicate entry
    if (exception.code === 'ER_DUP_ENTRY' || exception.errno === 1062) {
      status = HttpStatus.BAD_REQUEST;
      const detail = exception.sqlMessage || '';
      
      if (detail.includes('cedula')) {
        message = 'Error: Esta cedula ya esta registrada en otra ficha. Verifique el numero e intente de nuevo.';
      } else if (detail.includes('email')) {
        message = 'Error: Este correo electronico ya se encuentra en uso por otro usuario.';
      } else if (detail.includes('username')) {
        message = 'Error: El nombre de usuario ya esta ocupado.';
      } else if (detail.includes('phone') || detail.includes('whatsapp')) {
        message = 'Error: Este numero telefonico ya se encuentra registrado.';
      } else {
        message = 'Error: Uno de los datos clave que intenta registrar ya existe en la base de datos (Duplicado).';
      }
    } else {
      message = `Error BD: ${exception.sqlMessage || exception.message || 'Error desconocido'}`;
    }

    response.status(status).json({
      statusCode: status,
      error: 'Conflict',
      message: message,
    });
  }
}
