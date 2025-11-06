/**
 * Tests for server types
 */

import { describe, test, expect } from 'bun:test';
import { MCPError, ErrorCodes } from './server.js';

describe('MCPError', () => {
  test('should create error with message and default code', () => {
    const error = new MCPError('Test error');
    expect(error.message).toBe('Test error');
    expect(error.code).toBe(-32603);
    expect(error.name).toBe('MCPError');
  });

  test('should create error with custom code', () => {
    const error = new MCPError('Test error', ErrorCodes.INVALID_REQUEST);
    expect(error.code).toBe(-32600);
  });

  test('should create error with additional data', () => {
    const error = new MCPError('Test error', ErrorCodes.INTERNAL_ERROR, { foo: 'bar' });
    expect(error.data).toEqual({ foo: 'bar' });
  });

  test('should be instance of Error', () => {
    const error = new MCPError('Test error');
    expect(error).toBeInstanceOf(Error);
  });
});

describe('ErrorCodes', () => {
  test('should have correct error code values', () => {
    expect(ErrorCodes.PARSE_ERROR).toBe(-32700);
    expect(ErrorCodes.INVALID_REQUEST).toBe(-32600);
    expect(ErrorCodes.METHOD_NOT_FOUND).toBe(-32601);
    expect(ErrorCodes.INVALID_PARAMS).toBe(-32602);
    expect(ErrorCodes.INTERNAL_ERROR).toBe(-32603);
  });
});
